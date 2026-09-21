import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FaArrowLeft, FaChevronRight, FaCircleCheck, FaCloudArrowUp, FaImage, FaLocationDot, FaPaperPlane, FaPhone, FaRoad, FaShieldHalved, FaUsers, FaWater, FaXmark } from 'react-icons/fa6'
import { barangayHotlineGroups } from '../data/emergencyContacts'
import { evidenceUploadsEnabled, evidenceUploadSetupNotice } from '../reportFeatures'
import { evidencePhotoError, reportSubmissionError, type CreateFloodReportResult, type FloodReportInput, type FloodSeverity } from '../report'
import './ReportFlood.css'

type ReportFloodProps = {
  onBack: () => void
  onContacts: () => void
  onMyReports: () => void
  onSubmitReport: (report: FloodReportInput) => Promise<CreateFloodReportResult>
}
type FloodReportForm = Omit<FloodReportInput, 'severity'> & { severity: FloodSeverity | '' }
const emptyForm: FloodReportForm = { barangay: '', locationDetails: '', severity: '', description: '', photo: null }
const severityOptions: FloodSeverity[] = ['Low', 'Medium', 'High']

function ReportFlood({ onBack, onContacts, onMyReports, onSubmitReport }: ReportFloodProps) {
  const [form, setForm] = useState<FloodReportForm>(emptyForm)
  const [submission, setSubmission] = useState<CreateFloodReportResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [draggingPhoto, setDraggingPhoto] = useState(false)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const submissionLock = useRef(false)
  const successHeading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!form.photo) { setPhotoPreviewUrl(''); return }
    const url = URL.createObjectURL(form.photo)
    setPhotoPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [form.photo])

  function updateField(field: Exclude<keyof FloodReportForm, 'photo' | 'severity'>, value: string) {
    setForm(current => ({ ...current, [field]: value }))
  }
  function choosePhoto(file: File | null) {
    if (submissionLock.current) return
    const error = file ? evidencePhotoError(file) : ''
    setPhotoError(error)
    // An invalid replacement must not discard an already-selected valid photo.
    if (!error) setForm(current => ({ ...current, photo: file }))
    if (fileInput.current) fileInput.current.value = ''
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submissionLock.current) return
    if (!form.severity) { setSubmitError('Please choose a flood severity.'); return }
    if (!form.barangay.trim() || !form.locationDetails.trim() || !form.description.trim()) {
      setSubmitError('Please fill in all required fields with more than spaces.')
      return
    }
    submissionLock.current = true
    setIsSubmitting(true)
    setSubmitError('')
    try {
      const result = await onSubmitReport({ ...form, severity: form.severity })
      setSubmission(result)
      setForm(emptyForm)
      requestAnimationFrame(() => {
        successHeading.current?.focus()
        successHeading.current?.scrollIntoView({ block: 'center' })
      })
    } catch (error) {
      console.error('Flood report submission failed', error)
      setSubmitError(reportSubmissionError(error))
    } finally {
      submissionLock.current = false
      setIsSubmitting(false)
    }
  }

  return <div className="flood-report-page">
    <header className="flood-report-hero">
      <div className="flood-report-width flood-report-hero-inner">
        <div><h2>A Safer, Stronger<br />Cainta Together</h2><p>Report. Be Informed. Be Prepared.</p></div>
        <div className="flood-report-motto"><span>Cainta</span><p>Our home. Our community. Our responsibility.</p></div>
      </div>
    </header>
    {submission ? <section className="flood-report-success" aria-labelledby="report-success-title">
      <span className="success-icon"><FaCircleCheck aria-hidden="true" /></span>
      <p className="eyebrow">REPORT SAVED</p>
      <h1 id="report-success-title" ref={successHeading} tabIndex={-1}>Your flood report was saved.</h1>
      <p>Your report has a <strong>Submitted</strong> status. Follow its progress in My Reports using this account.</p>
      <p className="flood-report-reference">Reference: <strong>{submission.reportId}</strong></p>
      {submission.photoUploaded && <p className="success-detail">Your optional photo was uploaded successfully.</p>}
      {submission.warning && <p className="form-warning" role="status">{submission.warning}</p>}
      <div className="flood-report-success-actions"><button className="primary-button" onClick={onMyReports}>View My Reports <FaChevronRight aria-hidden="true" /></button><button className="button button-outline" onClick={onBack}>Back to Home</button></div>
      <p className="flood-report-prototype">Student prototype only. A saved report does not dispatch emergency responders.</p>
    </section> : <div className="flood-report-width flood-report-layout">
      <section className="flood-report-card" aria-labelledby="report-form-title">
        <button className="flood-report-back" type="button" disabled={isSubmitting} onClick={onBack}><FaArrowLeft aria-hidden="true" /> Back to Home</button>
        <div className="flood-report-heading"><p className="eyebrow">FLOOD INCIDENT REPORT</p><h1 id="report-form-title">Report a flood incident</h1></div>
        <p className="flood-report-intro">Provide accurate information to help DRRMO staff review the incident. A photo is optional and is only used as supporting evidence.</p>
        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <fieldset className="flood-report-fields" disabled={isSubmitting}>
            <legend className="sr-only">Flood incident details</legend>
            <div className="form-group">
              <label htmlFor="barangay">Barangay <span aria-hidden="true">*</span></label>
              <div className="flood-report-input-icon"><FaLocationDot aria-hidden="true" /><select id="barangay" value={form.barangay} onChange={event => updateField('barangay', event.target.value)} required>
                <option value="" disabled>Select your barangay</option>
                {barangayHotlineGroups.map(group => <option key={group.id} value={group.barangay}>Barangay {group.barangay}</option>)}
              </select></div>
            </div>
            <div className="form-group">
              <label htmlFor="locationDetails">Detailed Location <span aria-hidden="true">*</span></label>
              <div className="flood-report-input-icon"><FaRoad aria-hidden="true" /><input id="locationDetails" maxLength={300} value={form.locationDetails} onChange={event => updateField('locationDetails', event.target.value)} placeholder="Street, landmark, or nearby location" required /></div>
            </div>
            <fieldset className="flood-report-severity">
              <legend>Flood Severity <span aria-hidden="true">*</span></legend>
              <div className="flood-report-severity-options">{severityOptions.map(severity => <label key={severity}>
                <input type="radio" name="severity" value={severity} checked={form.severity === severity} onChange={() => setForm(current => ({ ...current, severity }))} required />
                <span><FaWater aria-hidden="true" />{severity}</span>
              </label>)}</div>
            </fieldset>
            <div className="form-group">
              <label htmlFor="description">Description <span aria-hidden="true">*</span></label>
              <textarea id="description" maxLength={3000} value={form.description} onChange={event => updateField('description', event.target.value)} placeholder="Describe what you can safely observe in your area." rows={3} required />
            </div>
            <div className="form-group flood-report-photo-group">
              <label htmlFor="photo">Optional Photo</label>
              <div className={'flood-report-dropzone' + (draggingPhoto ? ' is-dragging' : '')}
                onDragOver={event => { event.preventDefault(); if (!isSubmitting) setDraggingPhoto(true) }}
                onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDraggingPhoto(false) }}
                onDrop={event => {
                  event.preventDefault(); setDraggingPhoto(false)
                  if (isSubmitting) return
                  if (event.dataTransfer.files.length !== 1) { setPhotoError('Please choose one photo at a time.'); return }
                  choosePhoto(event.dataTransfer.files[0])
                }}>
                {form.photo ? <><div className="flood-report-photo-preview">{photoPreviewUrl && <img src={photoPreviewUrl} alt="Preview of selected flood evidence" />}</div><div className="flood-report-file" role="status">
                  <span className="flood-report-file-icon"><FaImage aria-hidden="true" /></span>
                  <div><strong>{form.photo.name}</strong><small>{form.photo.size < 1024 * 1024 ? Math.max(1, Math.round(form.photo.size / 1024)) + ' KB' : (form.photo.size / (1024 * 1024)).toFixed(1) + ' MB'} · {evidenceUploadsEnabled ? 'Ready to upload' : 'Selected on this device only'}</small></div>
                  <FaCircleCheck className="flood-report-file-check" aria-hidden="true" />
                  <button type="button" className="flood-report-remove" aria-label="Remove selected photo" onClick={() => choosePhoto(null)}><FaXmark aria-hidden="true" /></button>
                </div></> : <p className="flood-report-photo-empty"><FaImage aria-hidden="true" /> Add a photo only if it is safe and available.</p>}
                <div className="flood-report-photo-actions"><label className="flood-report-file-picker"><FaCloudArrowUp aria-hidden="true" /><span>{form.photo ? 'Change Photo' : 'Choose File'}</span><input ref={fileInput} id="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help photo-error photo-availability" onChange={event => { const file = event.target.files?.[0]; if (file) choosePhoto(file) }} /></label><span>or drag and drop a file here</span></div>
              </div>
              <small id="photo-help">JPG, PNG, or WebP; maximum 5 MB. You can submit without a photo.</small>
              <div id="photo-availability">{!evidenceUploadsEnabled && <p className="flood-report-upload-notice">{evidenceUploadSetupNotice}</p>}</div>
              <div id="photo-error">{photoError && <p className="form-error" role="alert">{photoError}</p>}</div>
            </div>
            <button className="primary-button flood-report-submit" type="submit"><FaPaperPlane aria-hidden="true" />{isSubmitting ? (form.photo && evidenceUploadsEnabled ? 'Saving report and photo…' : 'Saving report…') : 'Submit Flood Report'}</button>
          </fieldset>
          {isSubmitting && <p className="flood-report-saving" role="status">Please keep this page open while your report is being saved.</p>}
          {submitError && <p className="form-error" role="alert">{submitError}</p>}
          <p className="flood-report-review-note"><FaShieldHalved aria-hidden="true" /> Your report is submitted for staff review. Thank you for helping keep Cainta safe.</p>
        </form>
      </section>
      <aside className="flood-report-guide" aria-labelledby="report-guide-title">
        <div className="flood-report-guide-inner">
          <div className="flood-report-guide-heading"><span className="icon-disc"><FaUsers aria-hidden="true" /></span><div><h2 id="report-guide-title">How reporting works</h2><p>A few simple steps.</p></div></div>
          <ol className="flood-report-steps">
            <li><strong>Fill out the form</strong><p>Provide the location, severity, and a brief description.</p></li>
            <li><strong>Add a photo (optional)</strong><p>A photo provides supporting details. Never put yourself at risk to take one.</p></li>
            <li><strong>Submit your report</strong><p>Check My Reports for its status and updates from authorized staff.</p></li>
          </ol>
          <div className="flood-report-safety"><FaShieldHalved aria-hidden="true" /><div><h3>For everyone’s safety</h3><p>If you are in immediate danger, contact emergency services instead of waiting for a report update.</p></div></div>
          <button type="button" className="flood-report-contacts" onClick={onContacts}><FaPhone aria-hidden="true" /><span><strong>Emergency Contacts</strong><small>View service and barangay hotlines.</small></span><FaChevronRight aria-hidden="true" /></button>
          <div className="flood-report-guide-signoff"><p>Bantay Baha,<br />Bantay Cainta</p><small>Student prototype · Not a live emergency dispatch service</small></div>
        </div>
      </aside>
    </div>}
  </div>
}
export default ReportFlood
