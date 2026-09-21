import { useEffect, useState } from 'react'
import { getDownloadURL, ref } from 'firebase/storage'
import { storage } from './firebase'

type ReportEvidenceProps = {
  photoName: string
  photoPath: string
  alt: string
  compact?: boolean
}

export default function ReportEvidence({ photoName, photoPath, alt, compact = false }: ReportEvidenceProps) {
  const [result, setResult] = useState({ path: '', url: '', failed: false })

  useEffect(() => {
    let active = true

    getDownloadURL(ref(storage, photoPath)).then(
      (url) => { if (active) setResult({ path: photoPath, url, failed: false }) },
      () => { if (active) setResult({ path: photoPath, url: '', failed: true }) },
    )

    return () => { active = false }
  }, [photoPath])

  if (result.path === photoPath && result.failed) return <span className="photo-note">Evidence photo is temporarily unavailable.</span>
  if (result.path !== photoPath || !result.url) return <span className="photo-note" role="status">Loading evidence photo…</span>

  if (compact) return <img className="evidence-thumbnail" src={result.url} alt={alt} loading="lazy" onError={() => setResult({ path: photoPath, url: '', failed: true })} />

  return (
    <figure className="report-evidence">
      <img src={result.url} alt={alt} loading="lazy" onError={() => setResult({ path: photoPath, url: '', failed: true })} />
      <figcaption>Supporting evidence: {photoName}</figcaption>
    </figure>
  )
}
