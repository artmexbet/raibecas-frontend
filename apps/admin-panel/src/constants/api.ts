// API endpoints
export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  DOCUMENTS: {
    LIST: '/documents',
    CREATE: '/documents',
    UPDATE: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
  },
  USERS: {
    LIST: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  REGISTRATION_REQUESTS: {
    LIST: '/registration-requests',
    APPROVE: (id: string) => `/registration-requests/${id}/approve`,
    REJECT: (id: string) => `/registration-requests/${id}/reject`,
  },
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'admin_auth_token',
  ADMIN_DATA: 'admin_data',
} as const;

