import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evidencePhotoError, MAX_EVIDENCE_PHOTO_BYTES, reportSubmissionError } from '../src/report.ts'

test('photo validation accepts each supported image type and the 5 MB boundary', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
    assert.equal(evidencePhotoError({ type, size: MAX_EVIDENCE_PHOTO_BYTES }), '')
  }
  assert.match(evidencePhotoError({ type: 'image/png', size: MAX_EVIDENCE_PHOTO_BYTES + 1 }), /5 MB/)
  assert.match(evidencePhotoError({ type: 'text/plain', size: 100 }), /JPG, PNG, or WebP/)
})
test('save failures distinguish database rules, sign-in, network, and quota', () => {
  assert.match(reportSubmissionError({ code: 'permission-denied' }), /Firestore rules/)
  assert.match(reportSubmissionError({ code: 'firestore/permission-denied' }), /permission-denied/)
  assert.match(reportSubmissionError({ code: 'unauthenticated' }), /sign in again/)
  assert.match(reportSubmissionError({ code: 'auth/user-token-expired' }), /sign in again/)
  assert.match(reportSubmissionError({ code: 'unavailable' }), /My Reports/)
  assert.match(reportSubmissionError({ code: 'resource-exhausted' }), /usage limit/)
  assert.match(reportSubmissionError(null), /entries are still here/)
})
