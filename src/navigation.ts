export type ActivePage = 'home' | 'report' | 'my-reports' | 'admin' | 'admin-login' | 'resident-login' | 'preparedness' | 'advisories' | 'emergency-contacts'

export const publicNavigation: { page: ActivePage; label: string }[] = [
  { page: 'home', label: 'Home' },
  { page: 'my-reports', label: 'My Reports' },
  { page: 'preparedness', label: 'Preparedness' },
  { page: 'advisories', label: 'Advisories' },
  { page: 'emergency-contacts', label: 'Emergency Contacts' },
]
