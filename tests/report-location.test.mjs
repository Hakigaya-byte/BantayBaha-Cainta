import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { validCoordinates, manualCoordinates, requestCurrentLocation } from '../src/reportLocation.ts'

const point = manualCoordinates(14.578, 121.122)
test('coordinates reject missing, non-finite, out-of-range, and extra fields', () => {
  for (const value of [point, { ...point, source: 'device', accuracyMeters: 25 }, manualCoordinates(0, 0), manualCoordinates(-90, 180)]) assert.equal(validCoordinates(value), true)
  for (const value of [null, undefined, {}, { ...point, latitude: 91 }, { ...point, longitude: -181 }, { ...point, latitude: NaN }, { ...point, longitude: Infinity }, { ...point, latitude: '14.5' }, { ...point, source: 'unknown' }, { ...point, accuracyMeters: 1 }, { ...point, source: 'device', accuracyMeters: -1 }, { ...point, source: 'device', accuracyMeters: NaN }, { ...point, secret: 'not allowed' }]) assert.equal(validCoordinates(value), false)
})

test('device location is a single requested reading, with timeout and cancellation', () => {
  let success, failure, options, calls = 0
  const api = { getCurrentPosition(ok, fail, config) { calls++; success = ok; failure = fail; options = config } }
  const values = [], errors = []
  const cancel = requestCurrentLocation(api, value => values.push(value), error => errors.push(error))
  assert.equal(calls, 1)
  assert.deepEqual(options, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 })
  cancel()
  success({ coords: { latitude: 14.578, longitude: 121.122, accuracy: 30 } })
  failure({ code: 3 })
  assert.equal(values.length + errors.length, 0)
  requestCurrentLocation(api, value => values.push(value), error => errors.push(error))
  success({ coords: { latitude: 14.578, longitude: 121.122, accuracy: 30 } })
  success({ coords: { latitude: 10, longitude: 100, accuracy: 30 } })
  assert.deepEqual(values, [{ ...point, source: 'device', accuracyMeters: 30 }])
})

test('location denial, timeout, unavailable, and invalid readings offer manual recovery', () => {
  for (const code of [1, 2, 3]) {
    let message = ''
    requestCurrentLocation({ getCurrentPosition(ok, fail) { fail({ code }) } }, () => assert.fail(), value => { message = value })
    assert.match(message, /manual/)
  }
  requestCurrentLocation({ getCurrentPosition(ok) { ok({ coords: { latitude: NaN, longitude: 0, accuracy: 1 } }) } }, () => assert.fail(), message => assert.match(message, /invalid/))
})

let vite, Picker, StaffMap, SavedLocation
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
  Picker = (await vite.ssrLoadModule('/src/maps/LocationPicker.tsx')).default
  StaffMap = (await vite.ssrLoadModule('/src/maps/StaffReportMap.tsx')).default
  SavedLocation = (await vite.ssrLoadModule('/src/maps/ReportLocation.tsx')).default
})
after(async () => { await vite?.close() })
const render = (Component, props) => renderToStaticMarkup(createElement(Component, props))
test('picker starts without a pin, permission request, tiles, or prechecked confirmation', () => {
  const html = render(Picker, { value: null, confirmed: false, disabled: false, onChange() {}, onConfirm() {} })
  for (const text of ['Use my current location', 'Choose on map', 'I confirm', 'No background tracking', 'Enter coordinates manually']) assert.ok(html.includes(text))
  assert.ok(!html.includes('Selected pin:'))
  assert.ok(!html.includes('checked=""'))
  assert.ok(!html.includes('tile.openstreetmap.org'))
})
test('staff map counts all supplied reports including off-page and unmapped legacy records', () => {
  const reports = Array.from({ length: 7 }, (_, i) => ({ id: String(i), coordinates: point, barangay: 'San Andres', locationDetails: 'LOCAL TEST', severity: 'Low', status: 'Submitted' }))
  reports.push({ id: 'legacy' })
  const html = render(StaffMap, { reports, onSelect() {} })
  assert.match(html, /7 mapped/)
  assert.match(html, /1 without a map location/)
  assert.match(html, /not just the current table page/)
  assert.match(render(SavedLocation, { coordinates: null, label: 'Legacy' }), /No map location/)
  assert.match(render(SavedLocation, { coordinates: point, label: 'Saved pin' }), /14.578000, 121.122000/)
})
