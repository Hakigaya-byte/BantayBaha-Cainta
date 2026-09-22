import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

let vite, Home, Advisories
const noop = () => {}
const published = {
  id: 'test', category: 'Community', title: 'Published test notice', summary: 'For automated tests only.',
  isPublished: true, isSample: false, publishedAt: '2026-09-22T01:00:00Z',
}
const common = { advisories: [], loading: false, error: '', onRetry: noop }
before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
  Home = (await vite.ssrLoadModule('/src/Home.tsx')).default
  Advisories = (await vite.ssrLoadModule('/src/pages/Advisories.tsx')).default
})
after(async () => { await vite?.close() })
const home = (props = {}) => renderToStaticMarkup(createElement(Home, { ...common, onNavigate: noop, signedIn: false, ...props }))
const advisories = (props = {}) => renderToStaticMarkup(createElement(Advisories, { ...common, onBack: noop, ...props }))

test('guests and residents both keep the full information homepage', () => {
  for (const signedIn of [false, true]) {
    const html = home({ signedIn })
    for (const text of ['May baha sa lugar ninyo?', 'Report a Flood', 'Preparedness Guide', 'Community advisories', 'Mula report hanggang update.']) assert.ok(html.includes(text))
    assert.ok(!html.includes('Recent Reports'))
  }
  assert.ok(home({ signedIn: true }).includes('I-track ang updates ng inyong report sa My Reports.'))
  assert.ok(!home({ signedIn: true }).includes('Mag-sign in para'))
})

test('home and advisories distinguish loading, failure and a successful empty result', () => {
  for (const render of [home, advisories]) {
    const empty = render()
    assert.ok(empty.includes('No published advisories yet'))
    const loading = render({ loading: true })
    assert.ok(loading.includes('Loading'))
    assert.ok(!loading.includes('No published advisories yet'))
    const failed = render({ error: 'Connection unavailable' })
    assert.ok(failed.includes('Connection unavailable'))
    assert.ok(failed.includes('Try again'))
    assert.ok(!failed.includes('No published advisories yet'))
    assert.ok(!failed.includes('Sample Flood Monitoring Notice'))
  }
})

test('only real published notices appear in public information components', () => {
  const notices = [published, { ...published, id: 'draft', title: 'Private draft', isPublished: false }, { ...published, id: 'sample', title: 'Fictional sample', isSample: true }]
  for (const render of [home, advisories]) {
    const html = render({ advisories: notices })
    assert.ok(html.includes(published.title))
    assert.ok(!html.includes('Private draft'))
    assert.ok(!html.includes('Fictional sample'))
    assert.ok(!render({ advisories: notices, error: 'Connection unavailable' }).includes(published.title))
  }
})
