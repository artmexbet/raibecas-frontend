/**
 * Главный экспорт для системы моков
 *
 * Использование:
 *
 * import { MOCK_CONFIG, authMockHandlers } from '@/mocks';
 *
 * if (MOCK_CONFIG.enabled) {
 *   const response = await authMockHandlers.login(credentials);
 * }
 */

export * from './config';
export * from './data';
export * from './handlers';

