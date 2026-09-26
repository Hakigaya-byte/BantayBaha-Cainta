import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let vite, AdminAdvisories
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
  AdminAdvisories = (await vite.ssrLoadModule('/src/AdminAdvisories.tsx')).default
})
after(async () => { await vite?.close() })
const render = (props = {}) => renderToStaticMarkup(createElement(AdminAdvisories, {
  advisories: [], loading: false, error: '', onCreate: async () => {},
  onUpdate: async () => {}, onDelete: async () => {}, ...props,
}))

test('advisory editor includes the reference layout and accessible native form controls', () => {
  const html = render()
  for (const text of ['Manage advisories', 'Create an advisory', 'Advisory workflow', 'Draft', 'Review', 'Publish', 'Saved advisories', 'Create first advisory']) assert.ok(html.includes(text))
  for (const id of ['new-advisory-category', 'new-advisory-title', 'new-advisory-summary']) {
    assert.ok(html.includes(`for="${id}"`))
    assert.ok(html.includes(`id="${id}"`))
    assert.ok(html.includes(`aria-describedby="${id}-hint"`))
  }
  assert.ok(html.includes('maxLength="140"'))
  assert.ok(html.includes('maxLength="1500"'))
  assert.ok(html.includes('type="checkbox"'))
  assert.ok(!html.includes('checked=""'))
})

test('saved advisories distinguish loading, unavailable, and genuinely empty states', () => {
  assert.ok(render().includes('0 advisories'))
  assert.ok(render().includes('No staff advisories yet.'))
  for (const props of [{ loading: true }, { error: 'Database unavailable' }]) {
    const html = render(props)
    assert.ok(!html.includes('No staff advisories yet.'))
    assert.ok(!html.includes('0 advisories'))
  }
  assert.ok(render({ error: 'Database unavailable' }).includes('role="alert"'))
})

test('saved cards retain edit, publish/unpublish, and delete controls with actual counts', () => {
  const base = { category: 'Flood', title: 'LOCAL TEST ONLY', summary: 'Not a real advisory.', isSample: false, publishedAt: '', createdAt: '', updatedAt: '' }
  const html = render({ advisories: [{ ...base, id: 'draft', isPublished: false }, { ...base, id: 'published', isPublished: true }] })
  for (const text of ['2 advisories', 'DRAFT', 'PUBLISHED', 'Edit', 'Publish', 'Unpublish', 'Delete']) assert.ok(html.includes(text))
  assert.ok(!html.includes('No staff advisories yet.'))
  assert.ok(render({ advisories: [{ ...base, id: 'draft', isPublished: false }] }).includes('1 advisory'))
})
