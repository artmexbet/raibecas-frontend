export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  DOCUMENTS: '/documents',
  DOCUMENTS_CREATE: '/documents/new',
  DOCUMENTS_EDIT: (id: string) => `/documents/${id}/edit`,
  USERS: '/users',
  REGISTRATION_REQUESTS: '/registration-requests',
  SETTINGS: '/settings',
} as const;

