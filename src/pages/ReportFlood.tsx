import { useState, type FormEvent } from 'react'
import type { FloodReportInput, FloodSeverity } from '../report'

type ReportFloodProps = {
  onBack: () => void
  onSubmitReport: (report: FloodReportInput) => Promise<void>
}

type FloodReportForm = {
  barangay: string
  locationDetails: string
  severity: FloodSeverity | ''
  description: string
  photoName: string
}

const emptyForm: FloodReportForm = {
  barangay: '',
  locationDetails: '',
  severity: '',
  description: '',
  photoName: '',
}

function ReportFlood({ onBack, onSubmitReport }: ReportFloodProps) {
  const [form, setForm] = useState<FloodReportForm>(emptyForm)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function updateField(field: keyof FloodReportForm, value: string) {
    setForm({
      ...form,
      [field]: value,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (form.severity === '' || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await onSubmitReport({
        barangay: form.barangay,
        locationDetails: form.locationDetails,
        severity: form.severity,
        description: form.description,
        photoName: form.photoName,
      })

      setSubmitted(true)
      setForm(emptyForm)
    } catch {
      setSubmitError(
        'Your report could not be saved yet. Please check the Firebase Firestore setup, then try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <main className="report-page">
        <section className="success-card">
          <span className="success-icon">✓</span>
          <p className="eyebrow">TEST REPORT SUBMITTED</p>
          <h1>Your flood report was saved.</h1>
          <p>
            This sample report currently has a <strong>Submitted</strong> status.
            It is now saved in the Firebase database for this prototype.
          </p>

          <button className="primary-button" onClick={onBack}>
            Back to Home
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="report-page">
      <section className="report-form-card">
        <button className="back-button" onClick={onBack}>
          ← Back to Home
        </button>

        <p className="eyebrow report-eyebrow">FLOOD INCIDENT REPORT</p>
        <h1>Report a flood incident</h1>

        <p className="report-intro">
          Provide accurate information to help DRRMO staff review the incident.
          A photo is optional and is only used as supporting evidence.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="barangay">Barangay *</label>
            <input
              id="barangay"
              type="text"
              value={form.barangay}
              onChange={(event) => updateField('barangay', event.target.value)}
              placeholder="Enter barangay"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="locationDetails">Detailed Location *</label>
            <input
              id="locationDetails"
              type="text"
              value={form.locationDetails}
              onChange={(event) =>
                updateField('locationDetails', event.target.value)
              }
              placeholder="Street, landmark, or nearby location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="severity">Flood Severity *</label>
            <select
              id="severity"
              value={form.severity}
              onChange={(event) => updateField('severity', event.target.value)}
              required
            >
              <option value="">Select severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              placeholder="Describe the flood situation."
              rows={5}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo">Optional Photo</label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(event) =>
                updateField('photoName', event.target.files?.[0]?.name ?? '')
              }
            />
            <small>
              Upload a photo only if it is safe and available. A report can still
              be submitted without one.
            </small>
          </div>

          <button className="primary-button submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving report...' : 'Submit Flood Report'}
          </button>

          {submitError && <p className="form-error">{submitError}</p>}
        </form>
      </section>
    </main>
  )
}

export default ReportFlood