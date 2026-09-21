import { useRef, useState } from 'react'
import { FaArrowLeft, FaArrowRight, FaBell, FaBookOpen, FaBullhorn, FaCalendarDays, FaChevronRight, FaCloudRain, FaCircleInfo, FaMagnifyingGlass, FaPhone, FaUsers, FaWater } from 'react-icons/fa6'
import { sampleAdvisories, type Advisory, type AdvisoryCategory } from '../data/advisories'
import './Advisories.css'

type AdvisoriesProps = {
  advisories: Advisory[]
  loading: boolean
  error: string
  onBack: () => void
  onPreparedness?: () => void
  onContacts?: () => void
}
type AdvisoryFilter = 'All' | AdvisoryCategory
const filters: AdvisoryFilter[] = ['All', 'Flood', 'Weather', 'Community']
const categoryIcons = { Flood: FaWater, Weather: FaCloudRain, Community: FaBullhorn }
const categoryDescriptions = {
  Flood: 'Flood-related notices and preparedness reminders.',
  Weather: 'Weather updates and rainfall reminders.',
  Community: 'Community information and safety notices.',
}
function dateLabel(advisory: Advisory) {
  const date = new Date(advisory.publishedAt)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function Advisories({ advisories, loading, error, onBack, onPreparedness, onContacts }: AdvisoriesProps) {
  const listTitleRef = useRef<HTMLHeadingElement>(null)
  const [selectedFilter, setSelectedFilter] = useState<AdvisoryFilter>('All')
  const [search, setSearch] = useState('')
  const showingSamples = !loading && advisories.length === 0
  const availableAdvisories = showingSamples ? sampleAdvisories : advisories
  const query = search.trim().toLowerCase()
  const visibleAdvisories = availableAdvisories.filter((advisory) => (
    (selectedFilter === 'All' || advisory.category === selectedFilter)
    && `${advisory.title} ${advisory.summary} ${advisory.category}`.toLowerCase().includes(query)
  ))
  const latestAdvisory = availableAdvisories[0]
  const LatestIcon = latestAdvisory ? categoryIcons[latestAdvisory.category] : FaBell
  function browseAdvisories() {
    setSelectedFilter('All')
    setSearch('')
    listTitleRef.current?.focus({ preventScroll: true })
    listTitleRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }

  return (
    <section className="advisories-page container" aria-label="Community advisories">
      {!loading && latestAdvisory && <section className="advisory-featured panel" aria-label="Latest advisory">
        <span className={`advisory-icon advisory-icon-${latestAdvisory.category.toLowerCase()}`} aria-hidden="true"><LatestIcon /></span>
        <div className="advisory-featured-copy">
          <span className="advisory-featured-label">{latestAdvisory.isSample ? 'SAMPLE PREVIEW' : 'LATEST PUBLISHED UPDATE'}</span>
          <h2>{latestAdvisory.title}</h2><p>{latestAdvisory.summary}</p>
        </div>
        <div className="advisory-featured-meta"><span><FaCalendarDays aria-hidden="true" />{dateLabel(latestAdvisory)}</span><span><FaUsers aria-hidden="true" />{latestAdvisory.isSample ? 'Demo content' : 'Prototype staff'}</span></div>
        <button className="button advisory-browse" type="button" onClick={browseAdvisories}>Browse updates <FaArrowRight aria-hidden="true" /></button>
      </section>}

      <aside className="advisory-prototype-notice" aria-label="Prototype content notice">
        <FaCircleInfo aria-hidden="true" />
        <p><strong>{showingSamples ? 'Sample preview — no staff advisory is currently published.' : 'Published prototype advisories.'}</strong>{' '}{showingSamples ? 'These entries demonstrate the page and are not active warnings or official Cainta DRRMO announcements.' : 'Confirm urgent information through official local channels. This is a student prototype.'}</p>
      </aside>
      {error && <p className="form-error" role="alert">Live advisories could not be loaded. Sample entries are shown when available.</p>}

      <div className="advisories-layout">
        <div className="advisories-results">
          <div className="advisories-toolbar">
            <nav className="advisory-filters" aria-label="Filter advisories">{filters.map((filter) => {
              const count = filter === 'All' ? availableAdvisories.length : availableAdvisories.filter((item) => item.category === filter).length
              return <button key={filter} type="button" aria-pressed={selectedFilter === filter} onClick={() => setSelectedFilter(filter)}>{filter === 'All' ? 'All advisories' : filter} <span>({count})</span></button>
            })}</nav>
            <label className="advisory-search"><FaMagnifyingGlass aria-hidden="true" /><span className="sr-only">Search advisories</span><input type="search" placeholder="Search advisories…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          </div>
          <div className="advisory-results-heading"><h2 ref={listTitleRef} tabIndex={-1}>Community updates</h2><p className="advisory-count" role="status" aria-live="polite">{loading ? 'Loading…' : `${visibleAdvisories.length} ${visibleAdvisories.length === 1 ? 'advisory' : 'advisories'} shown`}</p></div>
          {loading ? <div className="advisory-empty panel" role="status"><FaCloudRain aria-hidden="true" /><p>Loading published advisories…</p></div> : <div className="advisory-list">
            {visibleAdvisories.length === 0 ? <div className="advisory-empty panel"><FaMagnifyingGlass aria-hidden="true" /><h3>No matching advisories</h3><p>Try a different search or choose another category.</p><button className="text-link" type="button" onClick={() => { setSearch(''); setSelectedFilter('All') }}>Clear filters <FaArrowRight aria-hidden="true" /></button></div> : visibleAdvisories.map((advisory) => {
              const Icon = categoryIcons[advisory.category]
              return <details className="advisory-card panel" key={advisory.id}>
                <summary>
                  <span className={`advisory-icon advisory-icon-${advisory.category.toLowerCase()}`} aria-hidden="true"><Icon /></span>
                  <span className="advisory-card-copy">
                    <span className="advisory-card-top"><span className={`advisory-category advisory-category-${advisory.category.toLowerCase()}`}>{advisory.category}</span><strong className={advisory.isSample ? 'sample-badge' : 'published-badge'}>{advisory.isSample ? 'SAMPLE' : 'PUBLISHED'}</strong></span>
                    <span className="advisory-card-title">{advisory.title}</span><span className="advisory-preview">{advisory.summary}</span>
                  </span>
                  <span className="advisory-card-meta"><span><FaCalendarDays aria-hidden="true" /><time dateTime={advisory.publishedAt || undefined}>{dateLabel(advisory)}</time></span><span><FaUsers aria-hidden="true" />{advisory.isSample ? 'Demo content' : 'Prototype staff'}</span></span>
                  <FaChevronRight className="advisory-chevron" aria-hidden="true" />
                </summary>
                <div className="advisory-full-content"><p>{advisory.summary}</p><small>{advisory.isSample ? 'Sample information only — this is not an active warning.' : 'Published in the BantayBaha Cainta student prototype. Confirm urgent information through official channels.'}</small></div>
              </details>
            })}
          </div>}
        </div>
        <aside className="advisories-sidebar" aria-label="Advisory resources">
          <section className="advisory-resource panel"><div className="advisory-resource-heading"><span className="advisory-icon"><FaBell aria-hidden="true" /></span><h2>Stay informed.<br />Stay prepared.</h2></div><p>Read the latest published notices, then make time to prepare your household. Small steps today can help you stay ready.</p>{onPreparedness && <button className="button button-blue" type="button" onClick={onPreparedness}><FaBookOpen aria-hidden="true" />Preparedness guide <FaArrowRight aria-hidden="true" /></button>}</section>
          <section className="advisory-categories panel"><h2>Advisory categories</h2>{(['Flood', 'Weather', 'Community'] as AdvisoryCategory[]).map((category) => {
            const Icon = categoryIcons[category]
            return <div className="advisory-category-guide" key={category}><span className={`advisory-icon advisory-icon-${category.toLowerCase()}`}><Icon aria-hidden="true" /></span><div><h3>{category}</h3><p>{categoryDescriptions[category]}</p></div></div>
          })}</section>
          {onContacts && <section className="advisory-contact-note"><FaPhone aria-hidden="true" /><div><h2>Need urgent assistance?</h2><p>Do not wait for a website update.</p><button className="text-link" type="button" onClick={onContacts}>View emergency contacts <FaArrowRight aria-hidden="true" /></button></div></section>}
        </aside>
      </div>
      <p className="advisory-reminder">For real emergencies, follow current instructions from your barangay and authorized government agencies.</p>
      <button className="text-link" type="button" onClick={onBack}><FaArrowLeft aria-hidden="true" />Back to Home</button>
    </section>
  )
}
