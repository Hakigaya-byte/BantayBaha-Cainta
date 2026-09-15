// Disposable local emulator accounts only; never seed the live Firebase project.
import { initializeApp, deleteApp } from 'firebase/app'
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
const app = initializeApp({ apiKey: 'demo-key', projectId: 'demo-bantaybaha' })
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
const env = await initializeTestEnvironment({ projectId: 'demo-bantaybaha', firestore: { host: '127.0.0.1', port: 8080 } })
try {
  const email = 'staff@example.test'
  const password = 'Local-test-only-123!'
  let account
  try { account = await createUserWithEmailAndPassword(auth, email, password) }
  catch (error) {
    if (error.code !== 'auth/email-already-in-use') throw error
    account = await signInWithEmailAndPassword(auth, email, password)
  }
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'staff', account.user.uid), { active: true }))
  console.log('Local emulator staff ready: staff@example.test / Local-test-only-123!')
} finally { await env.cleanup(); await deleteApp(app) }
