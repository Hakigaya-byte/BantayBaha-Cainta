// The live project is on Spark (checked 2026-09-21). Keep cloud uploads off
// until the owner approves Storage setup and publishes the evidence rules.
// This is a UI capability flag, not authorization; Firebase rules remain required.
const cloudEvidenceUploadsEnabled = false

export const evidenceUploadsEnabled = cloudEvidenceUploadsEnabled
  || (import.meta.env.DEV && import.meta.env.MODE === 'emulator')

export const evidenceUploadSetupNotice = 'Photo upload is not enabled for this prototype yet. You can select a photo to try the form, but it will not be attached. Your report details can still be saved.'
