export type ContactNumber = {
  label: string
  display: string
  dialValue: string
}

export type EmergencyContact = {
  id: string
  scope: 'Cainta' | 'National'
  name: string
  numbers: ContactNumber[]
  purpose: string
  sourceName: string
  sourceUrl?: string
}

export type BarangayHotlineGroup = {
  id: string
  barangay: string
  numbers: ContactNumber[]
}

export const emergencyContactsReviewedOn = '2026-09-16'

export const emergencyContacts: EmergencyContact[] = [
  {
    id: 'cainta-emergency',
    scope: 'Cainta',
    name: 'Cainta Emergency Hotline',
    numbers: [{ label: 'Connects to all first responders', display: '(02) 8535-0131', dialValue: '+63285350131' }],
    purpose: 'Primary emergency line published by the Municipality of Cainta and One Cainta.',
    sourceName: 'Municipality of Cainta official directory',
    sourceUrl: 'https://www.cainta.gov.ph/directory',
  },
  {
    id: 'cainta-drrmo',
    scope: 'Cainta',
    name: 'Cainta DRRMO',
    numbers: [
      { label: 'Emergency', display: '(02) 8535-0131', dialValue: '+63285350131' },
      { label: 'Office', display: '(02) 8696-2601', dialValue: '+63286962601' },
    ],
    purpose: 'Municipal Disaster Risk Reduction and Management Office contact numbers.',
    sourceName: 'Municipality of Cainta departments and offices directory',
    sourceUrl: 'https://www.cainta.gov.ph/departments-and-offices',
  },
  {
    id: 'cainta-fire',
    scope: 'Cainta',
    name: 'Cainta Fire',
    numbers: [
      { label: 'Landline', display: '(02) 8696-2616', dialValue: '+63286962616' },
      { label: 'Mobile', display: '0945-5719-109', dialValue: '+639455719109' },
    ],
    purpose: 'Fire and rescue contact numbers shown in the One Cainta emergency hotline graphic.',
    sourceName: 'One Cainta official Facebook hotline graphic supplied by the project owner',
  },
  {
    id: 'cainta-police',
    scope: 'Cainta',
    name: 'Cainta Police',
    numbers: [
      { label: 'Emergency', display: '911', dialValue: '911' },
      { label: 'Landline', display: '(02) 8696-2591', dialValue: '+63286962591' },
      { label: 'Mobile', display: '0998-5985-722', dialValue: '+639985985722' },
    ],
    purpose: 'Police emergency contacts shown in the One Cainta emergency hotline graphic.',
    sourceName: 'One Cainta official Facebook hotline graphic supplied by the project owner',
  },
  {
    id: 'cainta-hospital',
    scope: 'Cainta',
    name: 'Cainta Municipal Hospital',
    numbers: [{ label: 'Hospital', display: '(02) 8696-2605', dialValue: '+63286962605' }],
    purpose: 'Municipal hospital contact with 24-hour emergency room services.',
    sourceName: 'Municipality of Cainta hospital page',
    sourceUrl: 'https://www.cainta.gov.ph/caintahospital',
  },
  {
    id: 'philippine-red-cross',
    scope: 'National',
    name: 'Philippine Red Cross',
    numbers: [{ label: 'Emergency hotline', display: '143', dialValue: '143' }],
    purpose: 'For Philippine Red Cross emergency assistance and incident coordination.',
    sourceName: 'Philippine Red Cross Operations Center',
    sourceUrl: 'https://redcross.org.ph/operations-center/',
  },
]

export const barangayHotlineGroups: BarangayHotlineGroup[] = [
  {
    id: 'san-andres',
    barangay: 'San Andres',
    numbers: [
      { label: 'Barangay Office', display: '(02) 8646-0868', dialValue: '+63286460868' },
      { label: 'Kap. Benson Conde', display: '0917-554-8888', dialValue: '+639175548888' },
      { label: '24/7 BPSO', display: '0922-222-2229', dialValue: '+639222222229' },
      { label: '24/7 Fire & Rescue', display: '0999-220-2070', dialValue: '+639992202070' },
    ],
  },
  {
    id: 'san-isidro',
    barangay: 'San Isidro',
    numbers: [
      { label: 'Balanti', display: '(02) 7000-9557', dialValue: '+63270009557' },
      { label: 'Karangalan', display: '(02) 8242-5217', dialValue: '+63282425217' },
    ],
  },
  {
    id: 'san-juan',
    barangay: 'San Juan',
    numbers: [
      { label: 'Hotline 1', display: '(02) 8291-5078', dialValue: '+63282915078' },
      { label: 'Hotline 2', display: '(02) 8655-1679', dialValue: '+63286551679' },
    ],
  },
  {
    id: 'san-roque',
    barangay: 'San Roque',
    numbers: [{ label: 'Tanod / Ambulance', display: '0908-872-5572', dialValue: '+639088725572' }],
  },
  {
    id: 'sto-domingo',
    barangay: 'Sto. Domingo',
    numbers: [
      { label: 'Office', display: '(02) 8570-4492', dialValue: '+63285704492' },
      { label: 'Command Center', display: '(02) 8535-1183', dialValue: '+63285351183' },
      { label: 'Command Center Mobile', display: '0917-146-8497', dialValue: '+639171468497' },
      { label: 'Barangay Tanod HQ', display: '0923-020-5332', dialValue: '+639230205332' },
    ],
  },
  {
    id: 'sto-nino',
    barangay: 'Sto. Niño',
    numbers: [
      { label: 'Landline', display: '(02) 8712-3089', dialValue: '+63287123089' },
      { label: 'Mobile', display: '0917-147-2265', dialValue: '+639171472265' },
    ],
  },
  {
    id: 'sta-rosa',
    barangay: 'Sta. Rosa',
    numbers: [
      { label: 'Landline', display: '(02) 8693-9084', dialValue: '+63286939084' },
      { label: 'Mobile', display: '0998-869-3810', dialValue: '+639988693810' },
    ],
  },
]
