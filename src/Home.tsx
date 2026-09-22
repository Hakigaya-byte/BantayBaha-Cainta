import { FaFileLines, FaBookOpen, FaBullhorn, FaPhone, FaArrowRight, FaCloudRain, FaUsers, FaCircleCheck, FaCalendarDays } from 'react-icons/fa6'
import type { ActivePage } from './navigation'
import type { Advisory } from './data/advisories'

type Props = { onNavigate: (page: ActivePage) => void; advisories: Advisory[]; loading: boolean; error: string; signedIn: boolean; onRetry: () => void }
const shortcuts = [
  { icon: FaFileLines, title: 'Submit a Report', text: 'I-report ang baha sa inyong lugar.', page: 'report' },
  { icon: FaBookOpen, title: 'Be Prepared', text: 'Basahin ang mga gabay at tips.', page: 'preparedness' },
  { icon: FaBullhorn, title: 'Stay Informed', text: 'Tingnan ang pinakabagong advisories.', page: 'advisories' },
  { icon: FaPhone, title: 'Know Where to Call', text: 'Emergency at barangay contacts.', page: 'emergency-contacts' },
] as const

export default function Home({ onNavigate, advisories, loading, error, signedIn, onRetry }: Props) {
  const notices = advisories.filter(notice => notice.isPublished && !notice.isSample).slice(0, 2)
  return <>
    <section className="home-hero">
      <div className="container home-hero-inner">
        <div className="home-hero-copy">
          <p className="eyebrow">PARA SA MAS HANDANG CAINTA</p>
          <h1>May baha sa lugar ninyo?<br />I-report. <em>Maging handa.</em></h1>
          <p className="hero-description">Magpadala ng flood report at basahin ang preparedness guides, advisories, at emergency contacts para sa inyong komunidad.</p>
          <div className="hero-actions"><button className="button button-yellow" onClick={() => onNavigate('report')}><FaFileLines /> Report a Flood <FaArrowRight /></button><button className="button button-glass" onClick={() => onNavigate('preparedness')}><FaBookOpen /> Preparedness Guide</button></div>
          <p className="hero-helper">{signedIn ? 'I-track ang updates ng inyong report sa My Reports.' : 'Mag-sign in para magsumite at makita ang status ng report.'}</p>
        </div>
        <p className="community-script home-script">Bayanihan para sa<br />Ligtas na Cainta</p>
        <div className="hero-shortcuts">{shortcuts.map(item => <button key={item.page} className="shortcut-card" onClick={() => onNavigate(item.page)}><span className="icon-disc"><item.icon /></span><strong>{item.title}</strong><span>{item.text}</span></button>)}</div>
      </div>
    </section>
    <div className="container home-content">
      <div className="home-information">
        <section className="panel home-advisories">
          <p className="eyebrow">LATEST UPDATES</p>
          <div className="section-heading"><h2>Community advisories</h2><button className="text-link" onClick={() => onNavigate('advisories')}>View all advisories <FaArrowRight /></button></div>
          {loading ? <p role="status">Loading advisories…</p> : error ? <div><p className="form-error" role="alert">{error}</p><button className="text-link" type="button" onClick={onRetry}>Try again <FaArrowRight /></button></div> : notices.length === 0 ? <div className="home-advisory-empty" role="status"><p>No published advisories yet.</p><small>Staff updates will appear here once published. Check official local channels for current information.</small></div> : <div className="home-advisory-list">{notices.map(notice => <button type="button" className="home-advisory-row" key={notice.id} onClick={() => onNavigate('advisories')}><span className={`icon-disc ${notice.category === 'Community' ? 'icon-amber' : ''}`}>{notice.category === 'Community' ? <FaBullhorn /> : <FaCloudRain />}</span><span className="home-advisory-copy"><span className="mini-label">{notice.category}</span><strong>{notice.title}</strong><span>{notice.summary}</span></span><span className="home-advisory-date"><FaCalendarDays />{notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unavailable'}<small>Published by staff</small></span></button>)}</div>}
        </section>
        <section className="panel home-preparedness">
          <img src="/assets/emergency-kit.png" alt="Emergency backpack, water, flashlight and first-aid kit" />
          <div><h2>Handa bago pa bumaha.</h2><p>Basahin ang gabay bago, habang,<br />at pagkatapos ng baha.</p><button className="button button-blue" onClick={() => onNavigate('preparedness')}>Open preparedness guide <FaArrowRight /></button></div>
        </section>
      </div>
      <section className="panel how-it-works"><h2>Mula report hanggang update.</h2><div className="how-grid">{[{ icon: FaFileLines, title: 'Submit a report', text: 'Enter the location, severity, and incident details.' }, { icon: FaUsers, title: 'Staff review', text: 'Authorized staff review the submitted information.' }, { icon: FaCircleCheck, title: 'Check the status', text: 'View updates in My Reports.' }].map((step, i) => <div className="how-step" key={step.title}><span className="icon-disc"><step.icon /></span><div><span className="step-number">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p></div></div>)}<blockquote>Mas malinaw na impormasyon.<br />Mas handang komunidad.</blockquote></div></section>
    </div>
  </>
}
