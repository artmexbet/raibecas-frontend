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
  },
  DOCUMENTS: {
    LIST: '/documents',
    CREATE: '/documents',
    UPDATE: (id: string) => `/documents/${id}`,
    DELETE: (id: string) => `/documents/${id}`,
    COVER: (id: string) => `/documents/${id}/cover`,
    REINDEX: (id: string) => `/documents/${id}/reindex`,
  },
  AUTHORS: {
    LIST: '/authors',
    CREATE: '/authors',
    UPDATE: (id: string) => `/authors/${id}`,
    DELETE: (id: string) => `/authors/${id}`,
  },
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    UPDATE: (id: number) => `/categories/${id}`,
    DELETE: (id: number) => `/categories/${id}`,
  },
  TAGS: {
    LIST: '/tags',
    CREATE: '/tags',
    UPDATE: (id: number) => `/tags/${id}`,
    DELETE: (id: number) => `/tags/${id}`,
  },
  DOCUMENT_TYPES: {
    LIST: '/document-types',
  },
  AUTHORSHIP_TYPES: {
    LIST: '/authorship-types',
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
  CHAT: {
    SESSIONS: (userID: string) => `/chat/${userID}/sessions`,
  },
} as const;

// Storage keys (только для admin данных, токены в памяти и HttpOnly cookies)
export const STORAGE_KEYS = {
  ADMIN_DATA: 'admin_data', // Публичная информация о пользователе
} as const;
