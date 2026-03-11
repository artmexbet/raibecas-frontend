export const API_BASE_URL = 'http://localhost:8080/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    REGISTER: '/auth/register', // TODO: реализовать на бэкенде
  },
  DOCUMENTS: {
    LIST: '/documents',
    BY_ID: (id: string) => `/documents/${id}`,
    CONTENT: (id: string) => `/documents/${id}/content`, // TODO: реализовать на бэкенде
  },
  CATEGORIES: {
    LIST: '/categories',
  },
  TAGS: {
    LIST: '/tags',
  },
} as const;

export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
} as const;

