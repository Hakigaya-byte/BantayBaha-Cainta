import { useEffect, useRef, useState } from 'react'
import {
  goBagItems,
  preparednessReviewedOn,
  preparednessSections,
  preparednessSources,
} from '../data/preparedness'
import './Preparedness.css'

type PreparednessProps = { onBack: () => void }

export default function Preparedness({ onBack }: PreparednessProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [packedItems, setPackedItems] = useState<string[]>([])

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  function toggleItem(id: string) {
    setPackedItems((items) => items.includes(id)
      ? items.filter((item) => item !== id)
      : [...items, id])
  }

  function goToSection(id: string) {
    document.getElementById(id)?.focus()
  }

  return (
    <main className="preparedness-page">
      <div className="preparedness-content">
        <button className="back-button" type="button" onClick={onBack}>← Back to Home</button>

        <header className="preparedness-header">
          <p className="section-label">PUBLIC PREPAREDNESS GUIDE</p>
          <h1 ref={titleRef} tabIndex={-1}>Flood preparedness</h1>
          <p>Simple reminders para sa pamilya bago, habang, at pagkatapos ng baha. No login needed.</p>
        </header>

        <aside className="preparedness-notice" aria-label="Prototype and safety notice">
          <strong>School prototype — not an emergency response service.</strong>
          <p>General guidance lang ito, hindi live flood advisory o official Cainta DRRMO instruction.
            Unahin ang safety at sundin ang local authorities. Huwag maghintay ng website response kung kailangan ng agarang tulong.</p>
        </aside>

        <nav className="preparedness-jump-links" aria-label="Guide sections">
          {preparednessSections.map((section) => (
            <button key={section.id} type="button" onClick={() => goToSection(section.id)}>{section.title}</button>
          ))}
          <button type="button" onClick={() => goToSection('go-bag')}>Go-bag checklist</button>
          <button type="button" onClick={() => goToSection('guide-sources')}>Sources</button>
        </nav>

        <div className="preparedness-sections">
          {preparednessSections.map((section) => (
            <section className="preparedness-section" key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id} tabIndex={-1}>{section.title}</h2>
              <p className="preparedness-subtitle">{section.subtitle}</p>
              <ul className="preparedness-tips">
                {section.tips.map((tip) => (
                  <li key={tip.id}>
                    <p>{tip.text}</p>
                    <a href={preparednessSources[tip.source].url} target="_blank" rel="noopener noreferrer">
                      {preparednessSources[tip.source].name}<span className="preparedness-sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="preparedness-section" aria-labelledby="go-bag">
          <h2 id="go-bag" tabIndex={-1}>Emergency go-bag checklist</h2>
          <p>Maghanda ng essentials para sa tatlong araw, ayon sa Philippine Red Cross.
            I-adjust ang laman sa pangangailangan ng pamilya.</p>
          <p id="checklist-help" className="preparedness-subtitle">Tick items habang nagpa-pack. Temporary lang ang checks:
            magre-reset kapag umalis sa page o nag-refresh. Walang sine-save sa account o database.</p>

          <fieldset className="preparedness-checklist" aria-describedby="checklist-help">
            <legend>Items to pack</legend>
            {goBagItems.map((item) => (
              <label key={item.id}>
                <input type="checkbox" checked={packedItems.includes(item.id)} onChange={() => toggleItem(item.id)} />
                <span>{item.label}</span>
              </label>
            ))}
          </fieldset>

          <div className="preparedness-checklist-actions">
            <p role="status" aria-live="polite">{packedItems.length} of {goBagItems.length} items checked</p>
            <button type="button" onClick={() => setPackedItems([])} disabled={packedItems.length === 0}>Reset checklist</button>
          </div>
          <p className="preparedness-subtitle">Packing reminder lang ito, hindi guarantee na handa na sa lahat ng emergency.</p>
          <a href={preparednessSources.redCrossPH.url} target="_blank" rel="noopener noreferrer">
            Read the Philippine Red Cross go-bag guidance (new tab)
          </a>
        </section>

        <section className="preparedness-section preparedness-sources" aria-labelledby="guide-sources">
          <h2 id="guide-sources" tabIndex={-1}>Sources and content notes</h2>
          <p>Summarized in simple Taglish from the sources below. Sources checked on <time dateTime={preparednessReviewedOn}>15 September 2026</time>.
            This page is manually maintained, not automatically updated or approved by Cainta DRRMO.</p>
          <ul>
            {Object.entries(preparednessSources).map(([id, source]) => (
              <li key={id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name} (new tab)</a></li>
            ))}
          </ul>
          <p>Confirm current evacuation locations, routes, and instructions with your barangay or Cainta DRRMO.
            Walang unverified hotline o evacuation address na nakalista dito.</p>
        </section>
        <button className="back-button" type="button" onClick={onBack}>← Back to Home</button>
      </div>
    </main>
  )
}
