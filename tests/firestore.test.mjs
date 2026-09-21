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
const advisory = (published = true, extra = {}) => ({ category: 'Flood', title: 'TEST advisory',
  summary: 'TEST ONLY. Not a real warning.', isPublished: published,
  publishedAt: published ? serverTimestamp() : null, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...extra })
const resident = (uid = 'ana') => env.authenticatedContext(uid).firestore()
const reportDoc = (db, id = 'ana-report') => doc(db, 'floodReports', id)
const advisoryDoc = (db, id = 'published-advisory') => doc(db, 'advisories', id)
const storageRef = (uid, ownerId = uid, reportId = 'ana-report') => env.authenticatedContext(uid)
  .storage('gs://demo-bantaybaha.appspot.com').ref(`reportEvidence/${ownerId}/${reportId}/evidence`)

before(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-bantaybaha',
    firestore: { host: '127.0.0.1', port: 8080, rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8') },
    storage: { host: '127.0.0.1', port: 9199, rules: await readFile(new URL('../storage.rules', import.meta.url), 'utf8') } })
})
beforeEach(async () => {
  await Promise.all([env.clearFirestore(), env.clearStorage()])
  await env.withSecurityRulesDisabled(async (ctx) => {
    await Promise.all([
      setDoc(doc(ctx.firestore(), 'staff', 'staff-user'), { active: true }),
      setDoc(doc(ctx.firestore(), 'staff', 'inactive-staff'), { active: false }),
      setDoc(reportDoc(ctx.firestore()), report('ana')),
      setDoc(reportDoc(ctx.firestore(), 'ben-report'), report('ben')),
      setDoc(advisoryDoc(ctx.firestore()), advisory(true)),
      setDoc(advisoryDoc(ctx.firestore(), 'draft-advisory'), advisory(false)),
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
test('initial report works with no photoPath; the earlier empty-field payload also stays valid', async () => {
  const db = resident()
  await assertSucceeds(setDoc(reportDoc(db, 'without-photo-path'), report()))
  const saved = await getDoc(reportDoc(db, 'without-photo-path'))
  assert.equal('photoPath' in saved.data(), false)
  await assertSucceeds(setDoc(reportDoc(db, 'empty-photo-path'), report('ana', { photoPath: '' })))
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
test('resident can attach one evidence path to their own report but cannot replace it', async () => {
  const ref = reportDoc(resident())
  await assertSucceeds(updateDoc(ref, {
    photoName: 'test-evidence.jpg',
    photoPath: 'reportEvidence/ana/ana-report/evidence',
    updatedAt: serverTimestamp(),
  }))
  await assertFails(updateDoc(ref, {
    photoName: 'replacement.jpg',
    photoPath: 'reportEvidence/ana/ana-report/evidence',
    updatedAt: serverTimestamp(),
  }))
  await assertFails(updateDoc(reportDoc(resident(), 'ben-report'), {
    photoName: 'forged.jpg',
    photoPath: 'reportEvidence/ana/ben-report/evidence',
    updatedAt: serverTimestamp(),
  }))
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
    { photoName: false }, { photoName: 'not-empty.jpg' }, { photoPath: 'forged/path' }]) {
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
  for (const extra of [{ residentId: 'staff-user' }, { description: 'rewritten' }, { photoPath: 'forged' }, { createdAt: serverTimestamp() }, { status: 'Invalid' }]) {
    await assertFails(updateDoc(ref, { ...extra, updatedAt: serverTimestamp() }))
  }
  await assertFails(updateDoc(ref, { status: 'Resolved', updatedAt: 'forged' }))
  await assertFails(deleteDoc(ref))
  await assertFails(setDoc(doc(resident('staff-user'), 'staff', 'another'), { active: true }))
})
test('public users see published advisories only, while staff can manage all advisories', async () => {
  const guestDb = env.unauthenticatedContext().firestore()
  const publishedQuery = query(collection(guestDb, 'advisories'), where('isPublished', '==', true))
  assert.equal((await assertSucceeds(getDocs(publishedQuery))).size, 1)
  await assertSucceeds(getDoc(advisoryDoc(guestDb)))
  await assertFails(getDoc(advisoryDoc(guestDb, 'draft-advisory')))
  await assertFails(getDocs(collection(guestDb, 'advisories')))

  const staffDb = resident('staff-user')
  assert.equal((await assertSucceeds(getDocs(collection(staffDb, 'advisories')))).size, 2)
  await assertSucceeds(setDoc(advisoryDoc(staffDb, 'new-draft'), advisory(false)))
  await assertSucceeds(updateDoc(advisoryDoc(staffDb, 'new-draft'), {
    isPublished: true,
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }))
  await assertSucceeds(deleteDoc(advisoryDoc(staffDb, 'new-draft')))
})
test('residents cannot write advisories and invalid staff content is rejected', async () => {
  await assertFails(setDoc(advisoryDoc(resident(), 'resident-post'), advisory(true)))
  const staffDb = resident('staff-user')
  for (const extra of [{ category: 'Other' }, { title: ' ' }, { title: 'a'.repeat(141) }, { summary: 'a'.repeat(1501) }, { role: 'admin' }]) {
    await assertFails(setDoc(advisoryDoc(staffDb, 'invalid'), advisory(true, extra)))
  }
})
test('evidence photos are private to their owner and readable by active staff', async () => {
  const bytes = new Uint8Array([137, 80, 78, 71])
  await assertSucceeds(storageRef('ana').put(bytes, { contentType: 'image/png' }))
  await assertSucceeds(storageRef('ana').getDownloadURL())
  await assertSucceeds(storageRef('staff-user', 'ana').getDownloadURL())
  await assertFails(storageRef('ben', 'ana').getDownloadURL())
  const guestRef = env.unauthenticatedContext().storage('gs://demo-bantaybaha.appspot.com')
    .ref('reportEvidence/ana/ana-report/evidence')
  await assertFails(guestRef.getDownloadURL())
})
test('storage blocks wrong owners, non-images, oversized files, and replacements', async () => {
  const image = new Uint8Array([1, 2, 3])
  await assertFails(storageRef('ben', 'ana', 'wrong-owner').put(image, { contentType: 'image/png' }))
  await assertFails(storageRef('ana', 'ana', 'wrong-type').put(image, { contentType: 'text/plain' }))
  await assertFails(storageRef('ana', 'ana', 'oversized').put(new Uint8Array((5 * 1024 * 1024) + 1), { contentType: 'image/jpeg' }))
  await assertSucceeds(storageRef('ana', 'ana', 'replacement').put(image, { contentType: 'image/webp' }))
  await assertFails(storageRef('ana', 'ana', 'replacement').put(image, { contentType: 'image/png' }))
})
test('owner can delete an uploaded evidence photo during failed-submission cleanup', async () => {
  const image = new Uint8Array([1, 2, 3])
  await assertSucceeds(storageRef('ana', 'ana', 'cleanup').put(image, { contentType: 'image/webp' }))
  await assertSucceeds(storageRef('ana', 'ana', 'cleanup').delete())
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
