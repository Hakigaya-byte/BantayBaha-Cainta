import { useState, type ReactNode } from 'react'
import { FaBars, FaXmark, FaUser, FaUsers, FaArrowRightFromBracket, FaPhone, FaArrowLeft, FaHeadset } from 'react-icons/fa6'
import { publicNavigation, type ActivePage } from './navigation'

type Props = {
  page: ActivePage
  onNavigate: (page: ActivePage) => void
  userEmail?: string | null
  isStaff: boolean
  accountLoading: boolean
  loggingOut: boolean
  onLogout: () => Promise<void>
  children: ReactNode
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return <span className={`brand${footer ? ' brand-footer' : ''}`}>
    <img src="/assets/brand-mark-white.png" alt="" width="62" height="62" />
    <span><strong>BantayBaha Cainta</strong><small>A SAFER CAINTA, TOGETHER</small></span>
  </span>
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="page-hero">
    <div className="container page-hero-inner">
      <div className="page-hero-copy"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
      <p className="community-script">Bayanihan para sa<br />Ligtas na Cainta</p>
    </div>
  </header>
}

export default function SiteShell({ page, onNavigate, userEmail, isStaff, accountLoading, loggingOut, onLogout, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const loginPage = page === 'resident-login' || page === 'admin-login' || (!userEmail && !accountLoading && ['report', 'my-reports', 'admin'].includes(page))
  function navigate(next: ActivePage) { setMenuOpen(false); onNavigate(next) }
  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <div className="container header-inner">
        <button type="button" className="brand-button" aria-label="BantayBaha Cainta home" onClick={() => navigate('home')}><Brand /></button>
        {loginPage ? <div className="login-header-actions"><button className="text-link" onClick={() => navigate('home')}><FaArrowLeft /> Back to Home</button><button className="login-help-link" onClick={() => navigate('emergency-contacts')}><FaHeadset /><span><strong>Need Help?</strong><small>Contact directory</small></span></button></div> : <><button className="mobile-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <FaXmark /> : <FaBars />}</button>
        <nav id="main-navigation" className={`main-navigation${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          {publicNavigation.map(item => <button key={item.page} type="button" className={page === item.page ? 'active' : ''} aria-current={page === item.page ? 'page' : undefined} onClick={() => navigate(item.page)}>{item.label}</button>)}
          <div className="header-account">
            {isStaff ? <button className="button button-blue" type="button" onClick={() => navigate('admin')}><FaUsers /> Staff Dashboard</button> : !userEmail ? <button className="button button-outline" type="button" disabled={accountLoading} onClick={() => navigate('resident-login')}><FaUser /> Resident Login</button> : <span className="account-chip"><FaUser /><span title={userEmail}>{userEmail}</span></span>}
            {userEmail && <button className="icon-button logout-icon" type="button" aria-label="Log out" disabled={loggingOut} onClick={() => { setMenuOpen(false); void onLogout() }}><FaArrowRightFromBracket /></button>}
          </div>
        </nav></>}
      </div>
    </header>
    {page === 'home' && <div className="emergency-strip"><div className="container emergency-strip-inner"><span className="urgent-label"><FaPhone /> Urgent assistance</span><a href="tel:+63285350131">Cainta Emergency: <strong>(02) 8535-0131</strong></a><a href="tel:911">Emergency: <strong>911</strong></a><span className="strip-message">Stay alert. Stay informed. A safer Cainta for everyone.</span></div></div>}
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="site-footer">
      <img className="footer-wave" src="/assets/footer-wave.png" alt="" />
      <div className="container footer-inner">
        <button className="brand-button" type="button" aria-label="BantayBaha Cainta home" onClick={() => navigate('home')}><Brand footer /></button>
        <div className="footer-center"><nav aria-label="Footer navigation">{publicNavigation.map(item => <button type="button" key={item.page} onClick={() => navigate(item.page)}>{item.label}</button>)}</nav><p>Disaster-aware communities build stronger tomorrows.</p></div>
        <p className="footer-script">Ligtas na Cainta.<br />Sama-sama.</p>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} BantayBaha Cainta</span><button type="button" onClick={() => navigate(isStaff ? 'admin' : 'admin-login')}>{isStaff ? 'Staff Dashboard' : 'Staff Login'}</button><span>Student prototype · Not a live emergency dispatch service</span></div>
      </div>
    </footer>
  </div>
}
