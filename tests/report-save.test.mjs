import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createServer } from 'vite'

// Exercise the real save function without connecting to a live Firebase project.
const mockStore = `
  export const writes = [];
  export const collection = () => ({});
  export const doc = () => ({ id: 'local-test-report' });
  export const setDoc = async (ref, data) => { writes.push(data); };
  export const serverTimestamp = () => 'server-timestamp';
  export class Timestamp {}
  export const onSnapshot = () => {}, query = () => {}, updateDoc = () => {}, where = () => {};
`
let vite, createFloodReport, writes
before(async () => {
  vite = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom',
    plugins: [{
      name: 'isolated-report-save', enforce: 'pre',
      resolveId(id) { if (id.startsWith('virtual:report-test-')) return '\0' + id },
      load(id) {
        if (id === '\0virtual:report-test-store') return mockStore
        if (id === '\0virtual:report-test-firebase') return `export const auth = { currentUser: { uid: 'test-resident' } }, db = {}, storage = {};`
      },
      transform(code, id) {
        if (!id.replaceAll('\\', '/').endsWith('/src/firestoreReports.ts')) return
        return code.replace("from 'firebase/firestore'", "from 'virtual:report-test-store'")
          .replace("from './firebase'", "from 'virtual:report-test-firebase'")
      },
    }],
  })
  ;({ createFloodReport } = await vite.ssrLoadModule('/src/firestoreReports.ts'))
  ;({ writes } = await vite.ssrLoadModule('virtual:report-test-store'))
})
after(async () => { await vite?.close() })

const input = { barangay: 'San Andres', locationDetails: 'LOCAL TEST road', severity: 'Low', description: 'Test only.', photo: null, coordinates: null }
test('address-only report saves with no coordinates field', async () => {
  const result = await createFloodReport(input)
  assert.equal(result.reportId, 'local-test-report')
  const saved = writes.at(-1)
  assert.equal(Object.hasOwn(saved, 'coordinates'), false)
  assert.equal(saved.residentId, 'test-resident')
  assert.equal(saved.locationDetails, input.locationDetails)
  assert.equal(saved.status, 'Submitted')
})
test('a provided valid pin is saved, while malformed coordinates still fail', async () => {
  const coordinates = { latitude: 14.578, longitude: 121.122, source: 'manual', accuracyMeters: null }
  await createFloodReport({ ...input, coordinates })
  assert.deepEqual(writes.at(-1).coordinates, coordinates)
  const count = writes.length
  await assert.rejects(createFloodReport({ ...input, coordinates: { ...coordinates, latitude: 91 } }), /valid incident location/)
  assert.equal(writes.length, count)
})
test('skipping the map does not bypass required address and description validation', async () => {
  const count = writes.length
  for (const field of ['barangay', 'locationDetails', 'description']) {
    await assert.rejects(createFloodReport({ ...input, [field]: '  ' }), /required fields/)
  }
  assert.equal(writes.length, count)
})
