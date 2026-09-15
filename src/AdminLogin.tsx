import { useState, type FormEvent } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'
import { authErrorMessage } from './account'

type AdminLoginProps = {
  onBack: () => void
  onLoginSuccess: () => void
}

function AdminLogin({ onBack, onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

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
    <main className="report-page">
      <section className="report-form-card admin-login-card">
        <button className="back-button" type="button" onClick={onBack}>
          ← Back to Home
        </button>

        <p className="eyebrow report-eyebrow">DRRMO STAFF ACCESS</p>
        <h1>Staff login</h1>
        <p className="report-intro">
          Sign in using the authorized DRRMO staff account to review and update flood reports.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="staff-email">Staff Email</label>
            <input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter staff email"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="staff-password">Password</label>
            <input
              id="staff-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="primary-button submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in to Dashboard'}
          </button>

          {error && <p className="form-error" role="alert">{error}</p>}
        </form>

        <p className="admin-login-note">
          This area is for the BantayBaha Cainta DRRMO prototype staff account only.
        </p>
      </section>
    </main>
  )
}

export default AdminLogin
