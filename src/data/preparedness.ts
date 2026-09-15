// Keep editorial content separate from the page layout so it can be restyled later.
// These are paraphrased general tips, not live advisories or DRRMO-approved instructions.
export const preparednessReviewedOn = '2026-09-15'

export const preparednessSources = {
  pagasa: {
    name: 'DOST-PAGASA — Flood Safety Rules',
    url: 'https://www.pagasa.dost.gov.ph/learning-tools/floods',
  },
  redCrossPH: {
    name: 'Philippine Red Cross — Go-bag preparation',
    url: 'https://redcross.org.ph/2024/09/27/red-cross-on-full-alert-for-la-nina-and-upcoming-typhoons/',
  },
  redCross: {
    name: 'American Red Cross — Flood Safety',
    url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/types-of-emergencies/flood.html',
  },
} as const

type SourceId = keyof typeof preparednessSources
type GuideSection = {
  id: string
  title: string
  subtitle: string
  tips: { id: string; text: string; source: SourceId }[]
}

export const preparednessSections: GuideSection[] = [
  {
    id: 'before-flood',
    title: 'Before a Flood',
    subtitle: 'Bago bumaha: plan ahead.',
    tips: [
      { id: 'monitor', text: 'Alamin ang flood risk at warning system sa inyong lugar. Subaybayan ang weather updates ng PAGASA.', source: 'pagasa' },
      { id: 'family-plan', text: 'Pag-usapan ang evacuation plan ng pamilya: saan pupunta at ano ang responsibilidad ng bawat isa.', source: 'pagasa' },
      { id: 'supplies', text: 'Maghanda ng drinking water, pagkaing hindi madaling masira, flashlight, at battery-powered radio.', source: 'pagasa' },
      { id: 'early-evacuation', text: 'Kapag kailangang lumikas, pumunta sa ligtas na lugar bago maputol ng baha ang daan.', source: 'pagasa' },
    ],
  },
  {
    id: 'during-flood',
    title: 'During a Flood',
    subtitle: 'Habang may baha: safety first.',
    tips: [
      { id: 'follow-instructions', text: 'Sundin ang evacuation instructions ng local authorities. Huwag ipagpaliban ang paglikas para lang makapag-submit ng online report.', source: 'redCross' },
      { id: 'avoid-floodwater', text: 'Huwag lumakad, lumangoy, o magmaneho sa baha. Hindi ligtas ang pagtawid kahit mukhang mababaw ang tubig.', source: 'redCross' },
      { id: 'electrical-safety', text: 'Lumayo sa basang electrical equipment. Huwag humawak ng switches o appliances habang nakatayo sa tubig.', source: 'redCross' },
    ],
  },
  {
    id: 'after-flood',
    title: 'After a Flood',
    subtitle: 'Pagkatapos bumaha: stay careful.',
    tips: [
      { id: 'safe-return', text: 'Bumalik lang sa bahay kapag sinabi ng authorities na ligtas na. Iwasan ang nakabagsak na kable at debris.', source: 'redCross' },
      { id: 'safe-supplies', text: 'Huwag kainin o inumin ang food at water na posibleng nakontamina ng baha.', source: 'pagasa' },
      { id: 'electrician', text: 'Ipa-check muna sa qualified electrician ang electrical system at appliances bago gamitin ulit.', source: 'pagasa' },
    ],
  },
]

export const goBagItems = [
  { id: 'water-food', label: 'Drinking water, ready-to-eat food, at eating utensils' },
  { id: 'light-radio', label: 'Flashlight, portable radio, at spare batteries' },
  { id: 'first-aid', label: 'First-aid kit at personal medicines' },
  { id: 'documents', label: 'Important personal documents at IDs' },
  { id: 'hygiene', label: 'Soap, toothbrush, sanitary items, at trash bags' },
  { id: 'clothing', label: 'Extra clothes, shoes, at blanket' },
  { id: 'whistle', label: 'Whistle para makatawag ng pansin' },
] as const
