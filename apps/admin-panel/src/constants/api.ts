// API endpoints
export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
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

// Storage keys (только для admin данных, токены в памяти)
export const STORAGE_KEYS = {
  ADMIN_DATA: 'admin_data',
  TOKEN_ID: 'token_id', // Храним token_id для logout
} as const;



