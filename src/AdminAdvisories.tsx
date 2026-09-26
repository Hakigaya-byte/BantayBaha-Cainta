import { useRef, useState, type FormEvent } from 'react'
import { TbBulb, TbChevronDown, TbCloudRain, TbDeviceFloppy, TbEye, TbEyeOff, TbFilePlus, TbFileText, TbInfoCircle, TbPencil, TbPlus, TbRipple, TbSpeakerphone, TbTrash } from 'react-icons/tb'
import type { Advisory, AdvisoryCategory, AdvisoryInput } from './data/advisories'
import './AdminAdvisories.css'

type AdminAdvisoriesProps = {
  advisories: Advisory[]
  loading: boolean
  error: string
  onCreate: (input: AdvisoryInput) => Promise<void>
  onUpdate: (advisoryId: string, input: AdvisoryInput) => Promise<void>
  onDelete: (advisoryId: string) => Promise<void>
}

const categories: AdvisoryCategory[] = ['Flood', 'Weather', 'Community']
const categoryIcons = { Flood: TbRipple, Weather: TbCloudRain, Community: TbSpeakerphone }
const emptyAdvisory: AdvisoryInput = { category: 'Flood', title: '', summary: '', isPublished: false }

type AdvisoryFieldsProps = {
  idPrefix: string
  value: AdvisoryInput
  disabled: boolean
  onChange: (value: AdvisoryInput) => void
}

function AdvisoryFields({ idPrefix, value, disabled, onChange }: AdvisoryFieldsProps) {
  const CategoryIcon = categoryIcons[value.category]
  return (
    <fieldset className="advisory-fields" disabled={disabled}>
      <div className="form-group">
        <label htmlFor={`${idPrefix}-category`}>Category</label>
        <p id={`${idPrefix}-category-hint`} className="advisory-field-hint">Select the type of advisory.</p>
        <div className="advisory-category-select">
        <CategoryIcon aria-hidden="true" />
        <select id={`${idPrefix}-category`} aria-describedby={`${idPrefix}-category-hint`} value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value as AdvisoryCategory })}>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <TbChevronDown aria-hidden="true" />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor={`${idPrefix}-title`}>Advisory title</label>
        <p id={`${idPrefix}-title-hint`} className="advisory-field-hint">Write a clear and concise title.</p>
        <input id={`${idPrefix}-title`} aria-describedby={`${idPrefix}-title-hint`} placeholder="e.g. River water level update" required maxLength={140} value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
      </div>
      <div className="form-group advisory-summary-field">
        <label htmlFor={`${idPrefix}-summary`}>Advisory details</label>
        <p id={`${idPrefix}-summary-hint`} className="advisory-field-hint">Provide the complete details of the advisory.</p>
        <textarea id={`${idPrefix}-summary`} aria-describedby={`${idPrefix}-summary-hint`} placeholder="e.g. Current situation, affected areas, safety reminders, and other important information..." required maxLength={1500} rows={4} value={value.summary} onChange={(event) => onChange({ ...value, summary: event.target.value })} />
      </div>
      <label className="publish-control">
        <input type="checkbox" checked={value.isPublished} onChange={(event) => onChange({ ...value, isPublished: event.target.checked })} />
        <span>Publish immediately on the public Advisories page<small>Make this advisory visible to the public right away.</small></span>
      </label>
    </fieldset>
  )
}

export default function AdminAdvisories({ advisories, loading, error, onCreate, onUpdate, onDelete }: AdminAdvisoriesProps) {
  const createFormRef = useRef<HTMLFormElement>(null)
  const [newAdvisory, setNewAdvisory] = useState<AdvisoryInput>(emptyAdvisory)
  const [editingId, setEditingId] = useState('')
  const [editValue, setEditValue] = useState<AdvisoryInput>(emptyAdvisory)
  const [pendingId, setPendingId] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  async function runAction(id: string, action: () => Promise<void>, successMessage: string) {
    if (pendingId) return false
    setPendingId(id)
    setActionError('')
    setNotice('')
    try {
      await action()
      setNotice(successMessage)
      return true
    } catch {
      setActionError('The advisory change was not saved. Check your connection and staff access, then try again.')
      return false
    } finally {
      setPendingId('')
    }
  }

  async function submitNewAdvisory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const saved = await runAction('new', () => onCreate(newAdvisory), newAdvisory.isPublished ? 'Advisory published.' : 'Draft advisory saved.')
    if (saved) setNewAdvisory(emptyAdvisory)
  }

  function beginEdit(advisory: Advisory) {
    setEditingId(advisory.id)
    setEditValue({ category: advisory.category, title: advisory.title, summary: advisory.summary, isPublished: advisory.isPublished })
    setActionError('')
    setNotice('')
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const saved = await runAction(editingId, () => onUpdate(editingId, editValue), 'Advisory changes saved.')
    if (saved) setEditingId('')
  }

  function focusCreateForm() {
    createFormRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
    createFormRef.current?.querySelector<HTMLInputElement>('#new-advisory-title')?.focus({ preventScroll: true })
  }

  return (
    <section className="admin-advisories" aria-labelledby="manage-advisories-title">
      <header className="advisory-manager-heading">
          <h2 id="manage-advisories-title" tabIndex={-1}>Manage advisories</h2>
          <p>Create drafts, publish notices, edit details, or remove outdated prototype content.</p>
      </header>

      <div className="advisory-compose-layout">
      <form className="advisory-editor" ref={createFormRef} onSubmit={submitNewAdvisory} aria-labelledby="create-advisory-title" aria-busy={pendingId === 'new'}>
        <div className="advisory-panel-heading">
          <span className="advisory-tool-icon"><TbFilePlus aria-hidden="true" /></span>
          <div><h3 id="create-advisory-title">Create an advisory</h3><p>Share important information with the Cainta community.</p></div>
        </div>
        <AdvisoryFields idPrefix="new-advisory" value={newAdvisory} disabled={pendingId === 'new'} onChange={setNewAdvisory} />
        <button className="primary-button advisory-save-button" type="submit" disabled={Boolean(pendingId)}><TbDeviceFloppy aria-hidden="true" />{pendingId === 'new' ? 'Saving…' : 'Save advisory'}</button>
      </form>

      <aside className="advisory-workflow" aria-labelledby="advisory-workflow-title">
        <div className="advisory-panel-heading">
          <span className="advisory-tool-icon"><TbInfoCircle aria-hidden="true" /></span>
          <div><h3 id="advisory-workflow-title">Advisory workflow</h3><p>Follow these simple steps to get your advisory published.</p></div>
        </div>
        <ol className="advisory-workflow-steps">
          <li><span aria-hidden="true">1</span><div><h4>Draft</h4><p>Create your advisory and provide the details.</p></div></li>
          <li><span aria-hidden="true">2</span><div><h4>Review</h4><p>Double-check the information for accuracy and clarity.</p></div></li>
          <li><span aria-hidden="true">3</span><div><h4>Publish</h4><p>Save and publish to make it visible on the public Advisories page.</p></div></li>
        </ol>
        <div className="advisory-workflow-tip"><TbBulb aria-hidden="true" /><div><h4>Tip</h4><p>Use clear and concise information so residents can easily understand the advisory.</p></div></div>
      </aside>
      </div>

      {(error || actionError) && <p className="form-error" role="alert">{actionError || error}</p>}
      {notice && <p className="form-success" role="status">{notice}</p>}

      <section className="advisory-saved-panel" aria-labelledby="saved-advisories-title" aria-busy={loading}>
        <header className="advisory-saved-heading"><h3 id="saved-advisories-title"><TbFileText aria-hidden="true" />Saved advisories</h3><span className="advisory-saved-count">{loading ? 'Loading…' : error ? 'Unavailable' : `${advisories.length} ${advisories.length === 1 ? 'advisory' : 'advisories'}`}</span></header>
      <div className="managed-advisory-list">
        {loading ? <p className="advisory-list-message" role="status">Loading advisories…</p> : error ? <p className="advisory-list-message">Saved advisories are unavailable. Please check your connection and try again.</p> : advisories.length === 0 ? (
          <div className="advisory-saved-empty"><span className="advisory-empty-icon"><TbFileText aria-hidden="true" /></span><div><h3>No staff advisories yet.</h3><p>Create the first draft using the form above.</p><button className="button button-outline" type="button" onClick={focusCreateForm}><TbPlus aria-hidden="true" />Create first advisory</button></div></div>
        ) : advisories.map((advisory) => (
          <article className="managed-advisory-card" key={advisory.id}>
            {editingId === advisory.id ? (
              <form onSubmit={saveEdit}>
                <h3>Edit advisory</h3>
                <AdvisoryFields idPrefix={`edit-${advisory.id}`} value={editValue} disabled={pendingId === advisory.id} onChange={setEditValue} />
                <div className="managed-advisory-actions">
                  <button className="primary-button" type="submit" disabled={Boolean(pendingId)}><TbDeviceFloppy aria-hidden="true" />{pendingId === advisory.id ? 'Saving…' : 'Save changes'}</button>
                  <button className="logout-button" type="button" disabled={Boolean(pendingId)} onClick={() => setEditingId('')}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="advisory-card-top">
                  <span>{advisory.category}</span>
                  <strong className={advisory.isPublished ? 'published-badge' : 'draft-badge'}>{advisory.isPublished ? 'PUBLISHED' : 'DRAFT'}</strong>
                </div>
                <h3>{advisory.title}</h3>
                <p>{advisory.summary}</p>
                <div className="managed-advisory-actions">
                  <button className="logout-button" type="button" disabled={Boolean(pendingId)} onClick={() => beginEdit(advisory)}><TbPencil aria-hidden="true" />Edit</button>
                  <button className="logout-button" type="button" disabled={Boolean(pendingId)} onClick={() => void runAction(advisory.id, () => onUpdate(advisory.id, { category: advisory.category, title: advisory.title, summary: advisory.summary, isPublished: !advisory.isPublished }), advisory.isPublished ? 'Advisory moved to drafts.' : 'Advisory published.')}>{advisory.isPublished ? <TbEyeOff aria-hidden="true" /> : <TbEye aria-hidden="true" />}{advisory.isPublished ? 'Unpublish' : 'Publish'}</button>
                  <button className="danger-button" type="button" disabled={Boolean(pendingId)} onClick={() => {
                    if (window.confirm(`Remove “${advisory.title}”? This cannot be undone.`)) {
                      void runAction(advisory.id, () => onDelete(advisory.id), 'Advisory removed.')
                    }
                  }}><TbTrash aria-hidden="true" />Delete</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
      </section>
    </section>
  )
}
