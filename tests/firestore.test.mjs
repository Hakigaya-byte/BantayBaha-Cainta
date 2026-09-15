import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, setLogLevel, Timestamp, updateDoc, where } from 'firebase/firestore'
import { initializeApp, deleteApp } from 'firebase/app'
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

let env
setLogLevel('silent')
const report = (uid = 'ana', extra = {}) => ({ residentId: uid, barangay: 'San Andres', locationDetails: 'TEST road',
  description: 'TEST ONLY\nNo real incident.', severity: 'Low', photoName: '', status: 'Submitted',
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra })
const resident = (uid = 'ana') => env.authenticatedContext(uid).firestore()
const reportDoc = (db, id = 'ana-report') => doc(db, 'floodReports', id)

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-bantaybaha',
    firestore: { host: '127.0.0.1', port: 8080, rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') } })
})
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    await Promise.all([
      setDoc(doc(ctx.firestore(), 'staff', 'staff-user'), { active: true }),
      setDoc(doc(ctx.firestore(), 'staff', 'inactive-staff'), { active: false }),
      setDoc(reportDoc(ctx.firestore()), report('ana')),
      setDoc(reportDoc(ctx.firestore(), 'ben-report'), report('ben')),
    ])
  })
})
after(async () => { await env?.cleanup() })

test('guests cannot read, list, or create reports', async () => {
  const db = env.unauthenticatedContext().firestore()
  await assertFails(getDoc(reportDoc(db)))
  await assertFails(getDocs(collection(db, 'floodReports')))
  await assertFails(setDoc(reportDoc(db, 'guest-report'), report()))
})
test('resident can create and read their own report with server timestamps', async () => {
  const db = resident()
  await assertSucceeds(setDoc(reportDoc(db, 'new'), report()))
  const saved = await assertSucceeds(getDoc(reportDoc(db, 'new')))
  assert.equal(saved.data().residentId, 'ana')
  assert.ok(saved.data().createdAt instanceof Timestamp)
})
test('Ana and Ben can only query their own reports', async () => {
  for (const uid of ['ana', 'ben']) {
    const db = resident(uid)
    const own = await assertSucceeds(getDocs(query(collection(db, 'floodReports'), where('residentId', '==', uid))))
    assert.deepEqual(own.docs.map((d) => d.id), [`${uid}-report`])
    await assertFails(getDoc(reportDoc(db, `${uid === 'ana' ? 'ben' : 'ana'}-report`)))
    await assertFails(getDocs(collection(db, 'floodReports')))
    await assertFails(getDocs(query(collection(db, 'floodReports'), where('residentId', '==', uid === 'ana' ? 'ben' : 'ana'))))
  }
})
test('resident cannot impersonate another report owner', async () => {
  await assertFails(setDoc(reportDoc(resident(), 'forged'), report('ben')))
})
test('resident cannot change status, rewrite a report, or delete it', async () => {
  const ref = reportDoc(resident())
  await assertFails(updateDoc(ref, { status: 'Resolved', updatedAt: serverTimestamp() }))
  await assertFails(updateDoc(ref, { description: 'Modified', updatedAt: serverTimestamp() }))
  await assertFails(deleteDoc(ref))
})
test('resident can check own staff membership but cannot list or change roles', async () => {
  const db = resident()
  const own = await assertSucceeds(getDoc(doc(db, 'staff', 'ana')))
  assert.equal(own.exists(), false)
  await assertFails(getDoc(doc(db, 'staff', 'staff-user')))
  await assertFails(getDocs(collection(db, 'staff')))
  await assertFails(setDoc(doc(db, 'staff', 'ana'), { active: true }))
  await assertFails(setDoc(doc(db, 'users', 'ana'), { role: 'admin' }))
})
test('new reports cannot inject roles, staff notes, extra fields, or preverified status', async () => {
  for (const extra of [{ role: 'admin' }, { staffNote: 'internal' }, { status: 'Verified' }]) {
    await assertFails(setDoc(reportDoc(resident(), 'invalid'), report('ana', extra)))
  }
})
test('report fields enforce presence, types, whitespace, and length', async () => {
  for (const extra of [{ barangay: '' }, { barangay: ' \n\t ' }, { barangay: 123 }, { barangay: 'a'.repeat(101) },
    { locationDetails: 'a'.repeat(301) }, { description: 'a'.repeat(3001) }, { severity: 'Extreme' },
    { photoName: false }, { photoName: 'a'.repeat(256) }]) {
    await assertFails(setDoc(reportDoc(resident(), 'invalid'), report('ana', extra)))
  }
  const missing = report(); delete missing.description
  await assertFails(setDoc(reportDoc(resident(), 'invalid'), missing))
})
test('client cannot forge report timestamps', async () => {
  await assertFails(setDoc(reportDoc(resident(), 'invalid'), report('ana', { createdAt: 'fake-date' })))
  await assertFails(setDoc(reportDoc(resident(), 'invalid'), report('ana', { updatedAt: Timestamp.fromMillis(0) })))
})
test('active staff can view all reports and save each allowed status', async () => {
  const db = resident('staff-user')
  assert.equal((await assertSucceeds(getDocs(collection(db, 'floodReports')))).size, 2)
  for (const status of ['Under Review', 'Verified', 'Resolved', 'Closed', 'Submitted']) {
    await assertSucceeds(updateDoc(reportDoc(db), { status, updatedAt: serverTimestamp() }))
  }
})
test('staff cannot rewrite owner, content, timestamps, or remove reports', async () => {
  const ref = reportDoc(resident('staff-user'))
  for (const extra of [{ residentId: 'staff-user' }, { description: 'rewritten' }, { createdAt: serverTimestamp() }, { status: 'Invalid' }]) {
    await assertFails(updateDoc(ref, { ...extra, updatedAt: serverTimestamp() }))
  }
  await assertFails(updateDoc(ref, { status: 'Resolved', updatedAt: 'forged' }))
  await assertFails(deleteDoc(ref))
  await assertFails(setDoc(doc(resident('staff-user'), 'staff', 'another'), { active: true }))
})
test('inactive staff cannot query all reports or update status', async () => {
  const db = resident('inactive-staff')
  await assertFails(getDocs(collection(db, 'floodReports')))
  await assertFails(updateDoc(reportDoc(db), { status: 'Resolved', updatedAt: serverTimestamp() }))
})
test('revoking staff access blocks the next write', async () => {
  const db = resident('staff-user')
  await assertSucceeds(updateDoc(reportDoc(db), { status: 'Under Review', updatedAt: serverTimestamp() }))
  await env.withSecurityRulesDisabled((ctx) => updateDoc(doc(ctx.firestore(), 'staff', 'staff-user'), { active: false }))
  await assertFails(updateDoc(reportDoc(db), { status: 'Resolved', updatedAt: serverTimestamp() }))
})
test('legacy browser-ID demo reports remain staff-only and status-editable', async () => {
  await env.withSecurityRulesDisabled((ctx) => setDoc(reportDoc(ctx.firestore(), 'legacy'), report('old-browser-uuid',
    { createdAt: '2026-09-14T00:00:00.000Z', updatedAt: '2026-09-14T00:00:00.000Z', staffNote: '' })))
  await assertFails(getDoc(reportDoc(resident(), 'legacy')))
  await assertSucceeds(updateDoc(reportDoc(resident('staff-user'), 'legacy'), { status: 'Verified', updatedAt: serverTimestamp() }))
})
test('resident receives a live staff status update on their own report', async () => {
  let stop = () => {}
  const updated = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { stop(); reject(new Error('Live update timed out')) }, 10000)
    stop = onSnapshot(reportDoc(resident()), (snapshot) => {
      if (snapshot.data()?.status === 'Under Review') { clearTimeout(timer); stop(); resolve() }
    }, (error) => { clearTimeout(timer); reject(error) })
  })
  await updateDoc(reportDoc(resident('staff-user')), { status: 'Under Review', updatedAt: serverTimestamp() })
  await updated
})
test('real Auth emulator signup, login, ownership, invalid password, and logout', async () => {
  const app = initializeApp({ apiKey: 'demo-key', projectId: 'demo-bantaybaha' }, `test-${Date.now()}`)
  const auth = getAuth(app)
  const db = getFirestore(app)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  try {
    const email = `resident-${Date.now()}@example.test`
    const password = 'Local-test-only-123!'
    const account = await createUserWithEmailAndPassword(auth, email, password)
    await assertSucceeds(setDoc(reportDoc(db, 'auth-report'), report(account.user.uid)))
    assert.equal((await getDocs(query(collection(db, 'floodReports'), where('residentId', '==', account.user.uid)))).size, 1)
    await assertFails(getDocs(collection(db, 'floodReports')))
    await signOut(auth)
    assert.equal(auth.currentUser, null)
    await assertFails(getDocs(collection(db, 'floodReports')))
    await assert.rejects(signInWithEmailAndPassword(auth, email, 'wrong-password'))
    await signInWithEmailAndPassword(auth, email, password)
    assert.equal(auth.currentUser.uid, account.user.uid)
  } finally { await deleteApp(app) }
})
