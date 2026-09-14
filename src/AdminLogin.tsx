import { useState, type FormEvent } from 'react'
import { signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { auth } from './firebase'

type AdminLoginProps = {
  onBack: () => void
  onLoginSuccess: (user: User) => void
}

const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase()

function AdminLogin({ onBack, onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password)
      const signedInEmail = credentials.user.email?.toLowerCase()

      if (!signedInEmail || signedInEmail !== configuredAdminEmail) {
        await signOut(auth)
        setError('This account is not authorized to access the DRRMO staff dashboard.')
        return
      }

      onLoginSuccess(credentials.user)
    } catch {
      setError('Login failed. Check the staff email and password, then try again.')
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

          {error && <p className="form-error">{error}</p>}
        </form>

        <p className="admin-login-note">
          This area is for the BantayBaha Cainta DRRMO prototype staff account only.
        </p>
      </section>
    </main>
  )
}

export default AdminLogin
