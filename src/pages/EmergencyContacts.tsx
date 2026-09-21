import { useState } from 'react'
import {
  FaArrowLeft,
  FaArrowUpRightFromSquare,
  FaBuildingShield,
  FaChevronDown,
  FaCircleInfo,
  FaCross,
  FaFireFlameCurved,
  FaHospital,
  FaLocationDot,
  FaMagnifyingGlass,
  FaPhone,
  FaPhoneVolume,
  FaShieldHalved,
  FaTriangleExclamation,
} from 'react-icons/fa6'
import {
  barangayHotlineGroups,
  emergencyContacts,
  emergencyContactsReviewedOn,
  type ContactNumber,
} from '../data/emergencyContacts'
import './EmergencyContacts.css'

type EmergencyContactsProps = {
  onBack: () => void
}

const serviceIcons = {
  'cainta-drrmo': FaBuildingShield,
  'cainta-fire': FaFireFlameCurved,
  'cainta-police': FaShieldHalved,
  'cainta-hospital': FaHospital,
  'philippine-red-cross': FaCross,
}

function ContactLine({ number, name }: { number: ContactNumber; name: string }) {
  return (
    <a className="contacts-number" href={`tel:${number.dialValue}`} aria-label={`Call ${name}, ${number.label}, ${number.display}`}>
      <span><small>{number.label}</small><strong>{number.display}</strong></span>
      <span className="contacts-call-icon" aria-hidden="true"><FaPhone /></span>
    </a>
  )
}

export default function EmergencyContacts({ onBack }: EmergencyContactsProps) {
  const [search, setSearch] = useState('')
  const query = search.trim().toLocaleLowerCase()
  const filteredBarangays = barangayHotlineGroups.filter((group) =>
    `${group.barangay} ${group.numbers.map((number) => `${number.label} ${number.display}`).join(' ')}`
      .toLocaleLowerCase().includes(query),
  )
  const primaryContact = emergencyContacts.find((contact) => contact.id === 'cainta-emergency')!
  const primaryNumber = primaryContact.numbers[0]

  return (
    <div className="contacts-page container">
      <section className="contacts-priority" aria-labelledby="contacts-priority-heading">
        <div className="contacts-section-heading">
          <div><p className="eyebrow">EMERGENCY HOTLINES</p><h2 id="contacts-priority-heading">The right help. Within reach.</h2></div>
          <p>For an emergency, call directly. Do not wait for a website report to be reviewed.</p>
        </div>
        <div className="contacts-priority-grid">
          <a className="contacts-priority-card contacts-priority-cainta" href={`tel:${primaryNumber.dialValue}`}>
            <span className="contacts-priority-icon" aria-hidden="true"><FaPhoneVolume /></span>
            <span className="contacts-priority-copy"><small>CAINTA EMERGENCY</small><strong>{primaryNumber.display}</strong><span>Connects to all first responders</span></span>
            <span className="contacts-call-action"><FaPhone aria-hidden="true" /> Call now</span>
          </a>
          <a className="contacts-priority-card contacts-priority-national" href="tel:911">
            <span className="contacts-priority-icon" aria-hidden="true"><FaShieldHalved /></span>
            <span className="contacts-priority-copy"><small>EMERGENCY ASSISTANCE</small><strong>911</strong><span>Police, fire, and medical emergencies</span></span>
            <span className="contacts-call-action"><FaPhone aria-hidden="true" /> Call now</span>
          </a>
        </div>
      </section>

      <section className="contacts-services" aria-labelledby="contacts-services-heading">
        <div className="contacts-section-heading contacts-heading-compact">
          <h2 id="contacts-services-heading">Emergency & support services</h2>
          <span className="contacts-tap-hint"><FaPhone aria-hidden="true" /> Tap a number to call</span>
        </div>
        <div className="contacts-service-grid">
          {emergencyContacts.filter((contact) => contact.id !== 'cainta-emergency').map((contact) => {
            const Icon = serviceIcons[contact.id as keyof typeof serviceIcons] ?? FaPhone
            return (
              <article className={`contacts-service-card contacts-service-${contact.id}`} key={contact.id}>
                <div className="contacts-service-title"><span className="contacts-service-icon" aria-hidden="true"><Icon /></span><div><span className="contacts-scope">{contact.scope}</span><h3>{contact.name}</h3></div></div>
                <div className="contacts-number-list">{contact.numbers.map((number) => <ContactLine key={`${number.label}-${number.dialValue}`} number={number} name={contact.name} />)}</div>
                <details className="contacts-source-details"><summary>About this contact <FaChevronDown aria-hidden="true" /></summary><p>{contact.purpose}</p><p>Source: {contact.sourceUrl ? <a href={contact.sourceUrl} target="_blank" rel="noreferrer">{contact.sourceName} <FaArrowUpRightFromSquare aria-hidden="true" /></a> : contact.sourceName}</p></details>
              </article>
            )
          })}
          <aside className="contacts-call-reminder">
            <span className="contacts-reminder-icon" aria-hidden="true"><FaTriangleExclamation /></span>
            <p className="eyebrow">WHEN YOU CALL</p>
            <h3>Clear details help responders.</h3>
            <ol><li>Give your exact location and a nearby landmark.</li><li>Briefly describe what happened and who needs help.</li><li>Stay on the line and follow the operator’s instructions.</li></ol>
            <p>This student prototype is not an emergency dispatch service.</p>
          </aside>
        </div>
      </section>

      <section className="contacts-barangays" aria-labelledby="contacts-barangays-heading">
        <div className="contacts-section-heading">
          <div><p className="eyebrow">YOUR LOCAL COMMUNITY</p><h2 id="contacts-barangays-heading">Barangay hotlines</h2><p>Find contacts for all seven Cainta barangays.</p></div>
          <div className="contacts-search"><label htmlFor="barangay-contact-search">Find your barangay</label><div><FaMagnifyingGlass aria-hidden="true" /><input id="barangay-contact-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search barangay or contact…" /></div></div>
        </div>
        <p className="contacts-result-count" role="status">{filteredBarangays.length} of {barangayHotlineGroups.length} barangays shown · Select a barangay to see its numbers.</p>
        <div className="contacts-barangay-grid">
          {filteredBarangays.map((group) => (
            <details className="contacts-barangay-card" key={group.id}>
              <summary><span className="contacts-barangay-icon" aria-hidden="true"><FaLocationDot /></span><span><small>BARANGAY</small><strong>{group.barangay}</strong><span>{group.numbers.length} contact {group.numbers.length === 1 ? 'number' : 'numbers'}</span></span><FaChevronDown className="contacts-expand-icon" aria-hidden="true" /></summary>
              <div className="contacts-barangay-numbers">{group.numbers.map((number) => <ContactLine key={`${number.label}-${number.dialValue}`} number={number} name={`Barangay ${group.barangay}`} />)}</div>
            </details>
          ))}
        </div>
        {filteredBarangays.length === 0 && <div className="contacts-empty"><FaMagnifyingGlass aria-hidden="true" /><h3>No matching barangay or contact</h3><p>Try a name like San Andres, or clear your search to see all seven barangays.</p><button className="secondary-button" onClick={() => setSearch('')}>Clear search</button></div>}
      </section>

      <aside className="contacts-source-note"><FaCircleInfo aria-hidden="true" /><div><strong>Know where the numbers come from.</strong><p>Barangay contacts are transcribed from the One Cainta official Facebook hotline graphic supplied by the project owner. Service contacts cite their sources above. Directory reference date: {emergencyContactsReviewedOn}. Numbers and personnel can change; reconfirm with the relevant office before public use.</p><p>Primary hotline source: <a href={primaryContact.sourceUrl} target="_blank" rel="noreferrer">{primaryContact.sourceName} <FaArrowUpRightFromSquare aria-hidden="true" /></a>. Calls use your device’s phone app and may incur network charges.</p></div></aside>
      <button type="button" className="contacts-back" onClick={onBack}><FaArrowLeft aria-hidden="true" /> Back to home</button>
    </div>
  )
}
