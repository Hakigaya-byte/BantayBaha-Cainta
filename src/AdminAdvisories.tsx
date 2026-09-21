import { useState, type FormEvent } from 'react'
import type { Advisory, AdvisoryCategory, AdvisoryInput } from './data/advisories'

type AdminAdvisoriesProps = {
  advisories: Advisory[]
  loading: boolean
  error: string
  onCreate: (input: AdvisoryInput) => Promise<void>
  onUpdate: (advisoryId: string, input: AdvisoryInput) => Promise<void>
  onDelete: (advisoryId: string) => Promise<void>
}

const categories: AdvisoryCategory[] = ['Flood', 'Weather', 'Community']
const emptyAdvisory: AdvisoryInput = { category: 'Flood', title: '', summary: '', isPublished: false }

type AdvisoryFieldsProps = {
  idPrefix: string
  value: AdvisoryInput
  disabled: boolean
  onChange: (value: AdvisoryInput) => void
}

function AdvisoryFields({ idPrefix, value, disabled, onChange }: AdvisoryFieldsProps) {
  return (
    <fieldset className="advisory-fields" disabled={disabled}>
      <div className="form-group">
        <label htmlFor={`${idPrefix}-category`}>Category</label>
        <select id={`${idPrefix}-category`} value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value as AdvisoryCategory })}>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor={`${idPrefix}-title`}>Advisory title</label>
        <input id={`${idPrefix}-title`} required maxLength={140} value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
      </div>
      <div className="form-group advisory-summary-field">
        <label htmlFor={`${idPrefix}-summary`}>Advisory details</label>
        <textarea id={`${idPrefix}-summary`} required maxLength={1500} rows={4} value={value.summary} onChange={(event) => onChange({ ...value, summary: event.target.value })} />
      </div>
      <label className="publish-control">
        <input type="checkbox" checked={value.isPublished} onChange={(event) => onChange({ ...value, isPublished: event.target.checked })} />
        Publish immediately on the public Advisories page
      </label>
    </fieldset>
  )
}

export default function AdminAdvisories({ advisories, loading, error, onCreate, onUpdate, onDelete }: AdminAdvisoriesProps) {
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

  return (
    <section className="admin-advisories" aria-labelledby="manage-advisories-title">
      <div className="dashboard-toolbar">
        <div>
          <p className="section-label">STAFF CONTENT TOOLS</p>
          <h2 id="manage-advisories-title" tabIndex={-1}>Manage advisories</h2>
          <p>Create drafts, publish notices, edit details, or remove outdated prototype content.</p>
        </div>
      </div>

      <form className="advisory-editor" onSubmit={submitNewAdvisory}>
        <h3>Create an advisory</h3>
        <AdvisoryFields idPrefix="new-advisory" value={newAdvisory} disabled={pendingId === 'new'} onChange={setNewAdvisory} />
        <button className="primary-button" type="submit" disabled={Boolean(pendingId)}>{pendingId === 'new' ? 'Saving…' : 'Save advisory'}</button>
      </form>

      {(error || actionError) && <p className="form-error" role="alert">{actionError || error}</p>}
      {notice && <p className="form-success" role="status">{notice}</p>}

      <div className="managed-advisory-list">
        {loading ? <p role="status">Loading advisories…</p> : advisories.length === 0 ? (
          <div className="empty-reports"><h3>No staff advisories yet.</h3><p>Create the first draft using the form above.</p></div>
        ) : advisories.map((advisory) => (
          <article className="managed-advisory-card" key={advisory.id}>
            {editingId === advisory.id ? (
              <form onSubmit={saveEdit}>
                <h3>Edit advisory</h3>
                <AdvisoryFields idPrefix={`edit-${advisory.id}`} value={editValue} disabled={pendingId === advisory.id} onChange={setEditValue} />
                <div className="managed-advisory-actions">
                  <button className="primary-button" type="submit" disabled={Boolean(pendingId)}>Save changes</button>
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
                  <button className="logout-button" type="button" disabled={Boolean(pendingId)} onClick={() => beginEdit(advisory)}>Edit</button>
                  <button className="logout-button" type="button" disabled={Boolean(pendingId)} onClick={() => void runAction(advisory.id, () => onUpdate(advisory.id, { category: advisory.category, title: advisory.title, summary: advisory.summary, isPublished: !advisory.isPublished }), advisory.isPublished ? 'Advisory moved to drafts.' : 'Advisory published.')}>{advisory.isPublished ? 'Unpublish' : 'Publish'}</button>
                  <button className="danger-button" type="button" disabled={Boolean(pendingId)} onClick={() => {
                    if (window.confirm(`Remove “${advisory.title}”? This cannot be undone.`)) {
                      void runAction(advisory.id, () => onDelete(advisory.id), 'Advisory removed.')
                    }
                  }}>Delete</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
