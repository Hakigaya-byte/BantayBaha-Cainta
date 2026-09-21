export type AdvisoryCategory = 'Flood' | 'Weather' | 'Community'

export type AdvisoryInput = {
  category: AdvisoryCategory
  title: string
  summary: string
  isPublished: boolean
}

export type Advisory = AdvisoryInput & {
  id: string
  publishedAt: string
  createdAt: string
  updatedAt: string
  isSample: boolean
}

export const sampleAdvisories: Advisory[] = [
  {
    id: 'sample-flood-001',
    category: 'Flood',
    title: 'Sample Flood Monitoring Notice',
    summary: 'This is sample content showing how a flood monitoring advisory may appear on the website.',
    isPublished: true,
    publishedAt: '2026-09-15T08:00:00+08:00',
    createdAt: '2026-09-15T08:00:00+08:00',
    updatedAt: '2026-09-15T08:00:00+08:00',
    isSample: true,
  },
  {
    id: 'sample-weather-001',
    category: 'Weather',
    title: 'Sample Heavy Rain Reminder',
    summary: 'Residents are reminded to monitor official weather updates and prepare their emergency supplies.',
    isPublished: true,
    publishedAt: '2026-09-15T07:30:00+08:00',
    createdAt: '2026-09-15T07:30:00+08:00',
    updatedAt: '2026-09-15T07:30:00+08:00',
    isSample: true,
  },
  {
    id: 'sample-community-001',
    category: 'Community',
    title: 'Sample Community Safety Reminder',
    summary: 'Keep drainage areas clear and follow instructions from your barangay and local authorities.',
    isPublished: true,
    publishedAt: '2026-09-14T16:00:00+08:00',
    createdAt: '2026-09-14T16:00:00+08:00',
    updatedAt: '2026-09-14T16:00:00+08:00',
    isSample: true,
  },
]
