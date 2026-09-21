import { useRef, useState } from 'react'
import {
  FaArrowLeft, FaArrowRight, FaArrowUpRightFromSquare, FaBookOpen,
  FaBriefcaseMedical, FaChevronRight, FaHouse, FaLocationDot,
  FaShieldHalved, FaTriangleExclamation, FaWater,
} from 'react-icons/fa6'
import {
  goBagItems,
  preparednessReviewedOn,
  preparednessSections,
  preparednessSources,
} from '../data/preparedness'
import './Preparedness.css'

type PreparednessProps = { onBack: () => void; onContacts?: () => void }

const sectionPresentation = [
  { icon: FaShieldHalved, subtitle: 'Prepare your home, family, and essentials', heading: 'Prepare Today for a Safer Tomorrow.', description: 'Small preparations can make a big difference. Gamitin ang guide na ito para maihanda ang pamilya at mga kailangan ninyo.' },
  { icon: FaWater, subtitle: 'Stay alert and keep safe', heading: 'Safety First. Stay Together.', description: 'Unahin ang kaligtasan ng pamilya. Sundin ang authorities at huwag ipagpaliban ang paglikas para makapag-report online.' },
  { icon: FaHouse, subtitle: 'Recover safely and help your community', heading: 'Return Safely. Recover Carefully.', description: 'Kahit humupa na ang baha, may panganib pa rin. Mag-ingat at maghintay ng go-signal mula sa local authorities.' },
]

export default function Preparedness({ onBack, onContacts }: PreparednessProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [packedItems, setPackedItems] = useState<string[]>([])
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const activeSection = preparednessSections[activeIndex]
  const presentation = sectionPresentation[activeIndex]

  function toggleItem(id: string) {
    setPackedItems((items) => items.includes(id)
      ? items.filter((item) => item !== id)
      : [...items, id])
  }

  function moveTab(key: string) {
    let next = activeIndex
    if (key === 'ArrowRight') next = (activeIndex + 1) % preparednessSections.length
    else if (key === 'ArrowLeft') next = (activeIndex + preparednessSections.length - 1) % preparednessSections.length
    else if (key === 'Home') next = 0
    else if (key === 'End') next = preparednessSections.length - 1
    else return false
    setActiveIndex(next)
    tabRefs.current[next]?.focus()
    return true
  }

  return (
    <div className="preparedness-page container">
      <div className="preparedness-tabs panel" role="tablist" aria-label="Flood preparedness stages">
        {preparednessSections.map((section, index) => {
          const Icon = sectionPresentation[index].icon
          return (
            <button key={section.id} type="button" role="tab"
              id={`tab-${section.id}`} aria-selected={activeIndex === index}
              aria-controls="preparedness-stage-panel" tabIndex={activeIndex === index ? 0 : -1}
              ref={(element) => { tabRefs.current[index] = element }}
              className={`preparedness-tab ${activeIndex === index ? 'is-active' : ''}`}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => { if (moveTab(event.key)) event.preventDefault() }}>
              <span className="preparedness-tab-icon"><Icon aria-hidden="true" /></span>
              <span><strong>{section.title}</strong><small>{sectionPresentation[index].subtitle}</small></span>
              <FaChevronRight className="preparedness-tab-chevron" aria-hidden="true" />
            </button>
          )
        })}
      </div>

      <div id="preparedness-stage-panel" role="tabpanel" aria-labelledby={`tab-${activeSection.id}`} tabIndex={0}>
        <div className="preparedness-main-grid">
          <section className="preparedness-feature panel" aria-labelledby="preparedness-feature-title">
            <img src="/assets/family-preparedness.png" alt="Illustration of a family preparing an emergency bag together" />
            <div className="preparedness-feature-copy">
              <p className="preparedness-label">{activeSection.title}</p>
              <h2 id="preparedness-feature-title">{presentation.heading}</h2>
              <p>{presentation.description}</p>
            </div>
          </section>

          <section className="preparedness-bag panel" aria-labelledby="go-bag">
            <div className="preparedness-card-heading">
              <span className="preparedness-round-icon"><FaBriefcaseMedical aria-hidden="true" /></span>
              <div><h2 id="go-bag" className="preparedness-label">Go-bag checklist</h2>
                <p>Essentials para sa tatlong araw, ayon sa Philippine Red Cross. I-adjust sa needs ng pamilya.</p></div>
            </div>
            <fieldset className="preparedness-checklist" aria-describedby="checklist-help">
              <legend className="preparedness-sr-only">Items to pack</legend>
              {goBagItems.map((item) => (
                <label key={item.id} className={packedItems.includes(item.id) ? 'is-packed' : ''}>
                  <input type="checkbox" checked={packedItems.includes(item.id)} onChange={() => toggleItem(item.id)} />
                  <span>{item.label}</span>
                </label>
              ))}
            </fieldset>
            <div className="preparedness-checklist-actions">
              <p role="status" aria-live="polite">{packedItems.length} of {goBagItems.length} packed</p>
              <button type="button" onClick={() => setPackedItems([])} disabled={packedItems.length === 0}>Reset</button>
            </div>
            <p id="checklist-help" className="preparedness-fine-print">Checks reset when you leave or refresh. Packing reminder lang, hindi guarantee na handa na sa lahat ng emergency.</p>
          </section>

          <aside className="preparedness-resources" aria-label="Helpful resources">
            <section className="preparedness-resource-card preparedness-resource-warm panel">
              <div className="preparedness-card-heading">
                <span className="preparedness-round-icon"><FaLocationDot aria-hidden="true" /></span>
                <div><h2 className="preparedness-label">Evacuation reminders</h2>
                  <p>Confirm safe routes and evacuation locations with your barangay or Cainta DRRMO.</p></div>
              </div>
              {onContacts ? <button type="button" className="preparedness-resource-link" onClick={onContacts}>
                <FaHouse aria-hidden="true" /><span><strong>Contact your barangay</strong><small>Find local emergency contacts</small></span><FaChevronRight aria-hidden="true" />
              </button> : <p className="preparedness-fine-print">Sundin ang pinakabagong instructions ng local authorities.</p>}
            </section>
            <section className="preparedness-resource-card preparedness-resource-blue panel">
              <div className="preparedness-card-heading">
                <span className="preparedness-round-icon"><FaBookOpen aria-hidden="true" /></span>
                <div><h2 className="preparedness-label">Read the full guidance</h2><p>Safety information from trusted sources.</p></div>
              </div>
              <a className="preparedness-resource-link" href={preparednessSources.pagasa.url} target="_blank" rel="noopener noreferrer">
                <FaWater aria-hidden="true" /><span><strong>PAGASA Flood Safety Rules</strong><small>Open source website</small></span><FaArrowUpRightFromSquare aria-hidden="true" /><span className="preparedness-sr-only"> (opens in a new tab)</span>
              </a>
              <a className="preparedness-text-link" href={preparednessSources.redCrossPH.url} target="_blank" rel="noopener noreferrer">Philippine Red Cross go-bag guide <FaArrowRight aria-hidden="true" /><span className="preparedness-sr-only"> (opens in a new tab)</span></a>
            </section>
          </aside>
        </div>

        <section className="preparedness-quick-tips panel" aria-labelledby="preparedness-tips-title">
          <div className="preparedness-tips-heading"><p className="preparedness-label">Quick tips</p><h2 id="preparedness-tips-title">{activeSection.subtitle}</h2></div>
          <ul className="preparedness-tips">
            {activeSection.tips.map((tip, index) => (
              <li key={tip.id}><span className="preparedness-tip-number">0{index + 1}</span><div><p>{tip.text}</p>
                <a href={preparednessSources[tip.source].url} target="_blank" rel="noopener noreferrer">{preparednessSources[tip.source].name}<span className="preparedness-sr-only"> (opens in a new tab)</span></a>
              </div></li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="preparedness-notice" aria-label="Prototype and safety notice">
        <FaTriangleExclamation aria-hidden="true" /><p><strong>School prototype — not an emergency response service.</strong> General guidance lang ito, hindi live advisory o official Cainta DRRMO instruction. Unahin ang safety; huwag maghintay ng website response kung kailangan ng agarang tulong.</p>
      </aside>
      <details className="preparedness-sources panel">
        <summary>Sources and content notes</summary>
        <div><p>Summarized in simple Taglish from the sources below. Sources checked on <time dateTime={preparednessReviewedOn}>15 September 2026</time>. This page is manually maintained, not automatically updated or approved by Cainta DRRMO.</p>
          <ul>{Object.entries(preparednessSources).map(([id, source]) => (
            <li key={id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name} (new tab)</a></li>
          ))}</ul>
          <p>Confirm current evacuation locations, routes, and instructions with your barangay or Cainta DRRMO. Walang unverified hotline o evacuation address na nakalista dito.</p>
        </div>
      </details>
      <button className="preparedness-back" type="button" onClick={onBack}><FaArrowLeft aria-hidden="true" /> Back to Home</button>
    </div>
  )
}
