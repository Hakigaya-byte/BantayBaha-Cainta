import { useState, type FormEvent } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'
import { authErrorMessage } from './account'
import { FaArrowRightToBracket, FaEnvelope, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa6'
import LoginLayout from './LoginLayout'

type AdminLoginProps = {
  onBack: () => void
  onLoginSuccess: () => void
  onResidentLogin?: () => void
  onStaffLogin?: () => void
}

function AdminLogin({ onBack, onLoginSuccess, onResidentLogin, onStaffLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      onLoginSuccess()
    } catch (failure) {
      setError(authErrorMessage(failure))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LoginLayout role="staff" busy={isSubmitting} onBack={onBack} onResidentLogin={onResidentLogin} onStaffLogin={onStaffLogin}>
        <div className="login-card-heading"><h2>Welcome, DRRMO Staff!</h2>
          <p>Sign in with your authorized account to review and update flood reports.</p></div>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting} className="auth-fields">
          <div className="login-field">
            <label htmlFor="staff-email">Staff Email</label>
            <div className="login-input-wrap"><FaEnvelope aria-hidden="true" />
            <input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter staff email"
              autoComplete="username"
              required
              maxLength={254}
            /></div>
          </div>

          <div className="login-field">
            <label htmlFor="staff-password">Password</label>
            <div className="login-input-wrap"><FaLock aria-hidden="true" />
            <input
              id="staff-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
            <button type="button" className="login-password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}</button></div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit" disabled={isSubmitting}>
            <FaArrowRightToBracket aria-hidden="true" />
            {isSubmitting ? 'Signing in...' : 'Sign in to Dashboard'}
          </button>
          </fieldset>
        </form>
        <p className="login-staff-reminder">Staff accounts are assigned by the project administrator. There is no public staff registration.</p>
    </LoginLayout>
  )
}

export default AdminLogin
