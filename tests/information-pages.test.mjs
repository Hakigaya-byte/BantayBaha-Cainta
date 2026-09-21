import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sampleAdvisories } from '../src/data/advisories.ts'
import {
  barangayHotlineGroups,
  emergencyContacts,
} from '../src/data/emergencyContacts.ts'

test('sample advisories have unique IDs and cannot be mistaken for live warnings', () => {
  assert.equal(new Set(sampleAdvisories.map(({ id }) => id)).size, sampleAdvisories.length)
  for (const advisory of sampleAdvisories) {
    assert.equal(advisory.isSample, true)
    assert.ok(advisory.title.toLowerCase().includes('sample'))
    assert.ok(advisory.summary.trim())
  }
})

test('emergency contacts use unique IDs, dialable values, and valid source details', () => {
  assert.equal(new Set(emergencyContacts.map(({ id }) => id)).size, emergencyContacts.length)
  for (const contact of emergencyContacts) {
    assert.ok(contact.numbers.length > 0)
    for (const number of contact.numbers) {
      assert.match(number.dialValue, /^(?:\+\d+|\d+)$/)
      assert.ok(number.display.trim())
      assert.ok(number.label.trim())
    }
    if (contact.sourceUrl) assert.equal(new URL(contact.sourceUrl).protocol, 'https:')
    assert.ok(contact.sourceName.trim())
  }
})

test('Cainta main emergency number and every listed barangay are present', () => {
  const mainEmergency = emergencyContacts.find(({ id }) => id === 'cainta-emergency')
  assert.ok(mainEmergency)
  assert.ok(mainEmergency.numbers.some(({ dialValue }) => dialValue === '+63285350131'))

  assert.equal(barangayHotlineGroups.length, 7)
  assert.equal(new Set(barangayHotlineGroups.map(({ id }) => id)).size, barangayHotlineGroups.length)
  for (const group of barangayHotlineGroups) {
    assert.ok(group.barangay.trim())
    assert.ok(group.numbers.length > 0)
    for (const number of group.numbers) {
      assert.match(number.dialValue, /^(?:\+\d+|\d+)$/)
      assert.ok(number.display.trim())
    }
  }
})
