import { useState, type FormEvent } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'
import { authErrorMessage } from './account'

type Props = { onBack: () => void; onSuccess: () => void }

export default function ResidentLogin({ onBack, onSuccess }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const registering = mode === 'register'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')
    if (registering && password !== confirmation) {
      setError('Your passwords do not match. Please type them again.')
      return
    }
    setBusy(true)
    try {
      const signIn = registering ? createUserWithEmailAndPassword : signInWithEmailAndPassword
      await signIn(auth, email.trim(), password)
      onSuccess()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="report-page">
      <section className="report-form-card admin-login-card">
        <button className="back-button" type="button" onClick={onBack} disabled={busy}>← Back to Home</button>
        <p className="eyebrow report-eyebrow">RESIDENT ACCESS</p>
        <h1>{registering ? 'Create your account' : 'Resident login'}</h1>
        <p className="report-intro">Sign in to submit a flood report and follow updates on your own reports.</p>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="auth-fields">
            <div className="form-group">
              <label htmlFor="resident-email">Email</label>
              <input id="resident-email" type="email" required maxLength={254} autoComplete="username"
                value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="resident-password">Password</label>
              <input id="resident-password" type="password" required minLength={registering ? 12 : undefined}
                autoComplete={registering ? 'new-password' : 'current-password'}
                aria-describedby={registering ? 'password-help' : undefined}
                value={password} onChange={(event) => setPassword(event.target.value)} />
              {registering && <small id="password-help">Use at least 12 characters. A few unrelated words make a memorable password.</small>}
            </div>
            {registering && (
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm password</label>
                <input id="confirm-password" type="password" required autoComplete="new-password"
                  value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
              </div>
            )}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button submit-button" type="submit">
              {busy ? 'Please wait…' : registering ? 'Create resident account' : 'Sign in'}
            </button>
          </fieldset>
        </form>
        <button className="auth-switch" type="button" disabled={busy} onClick={() => {
          setMode(registering ? 'login' : 'register')
          setError('')
          setPassword('')
          setConfirmation('')
        }}>{registering ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
      </section>
    </main>
  )
}
