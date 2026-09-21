import type { ReactNode } from 'react'
import { FaArrowLeft, FaBullhorn, FaClock, FaFileLines, FaCircleInfo, FaUser, FaUsers } from 'react-icons/fa6'
import './Login.css'

type LoginLayoutProps = {
  role: 'resident' | 'staff'
  busy?: boolean
  onBack: () => void
  onResidentLogin?: () => void
  onStaffLogin?: () => void
  children: ReactNode
}

const features = [
  { icon: FaFileLines, title: 'Submit Reports', description: 'Report flooding in your area with a location and useful details.' },
  { icon: FaClock, title: 'Track Status', description: 'Follow your submitted reports and check updates from staff.' },
  { icon: FaBullhorn, title: 'Access Advisories', description: 'Read community advisories, preparedness guides, and emergency contacts.' },
]

export default function LoginLayout({ role, busy = false, onBack, onResidentLogin, onStaffLogin, children }: LoginLayoutProps) {
  return <section className="login-page">
    <img className="login-scene" src="/assets/cainta-river-hero.png" alt="" />
    <div className="login-layout container">
      <div className="login-story">
        <header className="login-welcome">
          <p className="login-eyebrow">Para sa mas handang Cainta</p>
          <h1>Welcome back to<br /><span>BantayBaha Cainta.</span></h1>
          <p>Log in to submit and track flood reports, view community advisories, and help build a safer, more resilient Cainta — together.</p>
        </header>
        <p className="login-script">Bayanihan para sa<br />Ligtas na Cainta</p>
        <div className="login-feature-list">
          {features.map(({ icon: Icon, title, description }) => <article className="login-feature" key={title}>
            <span className="login-feature-icon"><Icon aria-hidden="true" /></span>
            <h2>{title}</h2><p>{description}</p>
          </article>)}
        </div>
        <p className="login-story-signoff">A safer Cainta, together.</p>
      </div>
      <section className="login-card" aria-label={role === 'resident' ? 'Resident account access' : 'Staff account access'}>
        <nav className="login-role-switch" aria-label="Account type">
          <button type="button" className={role === 'resident' ? 'is-active' : ''} aria-current={role === 'resident' ? 'page' : undefined}
            disabled={busy || (role !== 'resident' && !onResidentLogin)} onClick={onResidentLogin}><FaUser aria-hidden="true" /> Resident Login</button>
          <button type="button" className={role === 'staff' ? 'is-active' : ''} aria-current={role === 'staff' ? 'page' : undefined}
            disabled={busy || (role !== 'staff' && !onStaffLogin)} onClick={onStaffLogin}><FaUsers aria-hidden="true" /> Staff Login</button>
        </nav>
        {children}
        <aside className="login-access-note"><FaCircleInfo aria-hidden="true" /><p><strong>Staff access is for authorized prototype personnel only.</strong><span>Resident accounts cannot access the staff dashboard.</span></p></aside>
        <button type="button" className="login-browse-link" disabled={busy} onClick={onBack}><FaArrowLeft aria-hidden="true" /> Browse the website without signing in</button>
      </section>
    </div>
  </section>
}
