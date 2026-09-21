import { useState, type FormEvent } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'
import { authErrorMessage } from './account'
import { FaArrowRightToBracket, FaCirclePlus, FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa6'
import LoginLayout from './LoginLayout'

type Props = { onBack: () => void; onSuccess: () => void; onResidentLogin?: () => void; onStaffLogin?: () => void }

export default function ResidentLogin({ onBack, onSuccess, onResidentLogin, onStaffLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  function changeMode(nextMode: 'login' | 'register') {
    setMode(nextMode)
    setError('')
    setPassword('')
    setConfirmation('')
    setShowPassword(false)
  }

  return (
    <LoginLayout role="resident" busy={busy} onBack={onBack} onStaffLogin={onStaffLogin}
      onResidentLogin={() => { if (registering) changeMode('login'); onResidentLogin?.() }}>
        <div className="login-card-heading">
          <h2>{registering ? 'Join us, Ka-Cainta!' : 'Welcome, Ka-Cainta!'}</h2>
          <p>{registering ? 'Create a resident account to submit and track your reports.' : 'Log in to your account to continue.'}</p>
        </div>
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="auth-fields">
            <div className="login-field">
              <label htmlFor="resident-email">Email Address</label>
              <div className="login-input-wrap"><FaEnvelope aria-hidden="true" />
              <input id="resident-email" type="email" required maxLength={254} autoComplete="username"
                placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            </div>
            <div className="login-field">
              <label htmlFor="resident-password">Password</label>
              <div className="login-input-wrap"><FaLock aria-hidden="true" />
              <input id="resident-password" type={showPassword ? 'text' : 'password'} required minLength={registering ? 12 : undefined}
                autoComplete={registering ? 'new-password' : 'current-password'}
                aria-describedby={registering ? 'password-help' : undefined}
                placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" className="login-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}</button></div>
              {registering && <small id="password-help">Use at least 12 characters. A few unrelated words make a memorable password.</small>}
            </div>
            {registering && (
              <div className="login-field">
                <label htmlFor="confirm-password">Confirm password</label>
                <div className="login-input-wrap"><FaLock aria-hidden="true" />
                <input id="confirm-password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                  placeholder="Type your password again" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div>
              </div>
            )}
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="login-submit" type="submit">
              {registering ? <FaCirclePlus aria-hidden="true" /> : <FaArrowRightToBracket aria-hidden="true" />}
              {busy ? 'Please wait…' : registering ? 'Create resident account' : 'Sign in'}
            </button>
          </fieldset>
        </form>
        <div className="login-divider"><span>or</span></div>
        <button className="login-secondary" type="button" disabled={busy} onClick={() => changeMode(registering ? 'login' : 'register')}>
          {registering ? <FaArrowRightToBracket aria-hidden="true" /> : <FaCirclePlus aria-hidden="true" />}
          {registering ? 'Already have an account? Sign in' : 'Create Resident Account'}
        </button>
    </LoginLayout>
  )
}
