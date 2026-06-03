// Prefer process.env when available (build-time define), fall back to import.meta.env in dev.
const runtimeEnv = ((globalThis as any).process?.env ?? (import.meta as any).env ?? {}) as Record<
  string,
  string | undefined
>;

export const API_BASE_URL = (runtimeEnv.BUN_PUBLIC_API_URL || 'http://localhost:8080') + '/api/v1';

export const CHAT_WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/v1$/, '/ws/chat');

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
  DOCUMENT_TYPES: {
    LIST: '/document-types',
  },
  BOOKMARKS: {
    LIST: '/bookmarks',
    BY_ID: (id: string) => `/bookmarks/${id}`,
  },
  NOTES: {
    LIST: '/notes',
    BY_ID: (id: string) => `/notes/${id}`,
  },
  CATEGORIES: {
    LIST: '/categories',
  },
  TAGS: {
    LIST: '/tags',
  },
  CHAT: {
    SESSIONS: (userID: string) => `/chat/${userID}/sessions`,
  },
  SEARCH: {
    QUERY: '/search',
  },
} as const;

export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
} as const;
