import assert from 'node:assert/strict'
import { test } from 'node:test'
import { goBagItems, preparednessSections, preparednessSources } from '../src/data/preparedness.ts'

test('guide covers before, during, and after flooding with stable section IDs', () => {
  assert.deepEqual(preparednessSections.map(({ id }) => id), ['before-flood', 'during-flood', 'after-flood'])
  for (const section of preparednessSections) {
    assert.ok(section.title && section.subtitle)
    assert.ok(section.tips.length >= 3)
  }
})

test('every guidance item has a known HTTPS source and a unique ID', () => {
  const tips = preparednessSections.flatMap(({ tips }) => tips)
  assert.equal(new Set(tips.map(({ id }) => id)).size, tips.length)
  for (const tip of tips) {
    assert.ok(tip.text.trim())
    const source = preparednessSources[tip.source]
    assert.ok(source, `Missing source for ${tip.id}`)
    assert.equal(new URL(source.url).protocol, 'https:')
  }
})

test('packing checklist has unique stable IDs and readable labels', () => {
  assert.equal(goBagItems.length, 7)
  assert.equal(new Set(goBagItems.map(({ id }) => id)).size, goBagItems.length)
  for (const item of goBagItems) assert.ok(item.label.trim())
})
