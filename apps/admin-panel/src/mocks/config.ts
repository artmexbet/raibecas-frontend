/**
 * Конфигурация моков
 * Здесь можно включать/выключать моки для разных модулей
 */

export const MOCK_CONFIG = {
  /** Включить моки (false = использовать реальный API) */
  enabled: true,

  /** Задержка ответа в миллисекундах (имитация сетевого запроса) */
  delay: 800,

  /** Моки для конкретных модулей */
  modules: {
    auth: false,
    documents: true,
    users: false,
    registrationRequests: false,
  },

  /** Вероятность ошибки (0-1, для тестирования обработки ошибок) */
  errorRate: 0,
} as const;

/**
 * Утилита для имитации API запроса с задержкой
 */
export async function mockApiCall<T>(
  data: T,
  delay: number = MOCK_CONFIG.delay
): Promise<{ data: T }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Имитация случайных ошибок
      if (MOCK_CONFIG.errorRate > 0 && Math.random() < MOCK_CONFIG.errorRate) {
        reject(new Error('Mock API Error'));
      } else {
        resolve({ data });
      }
    }, delay);
  });
}

/**
 * Проверка, включены ли моки для модуля
 */
export function isMockEnabled(module: keyof typeof MOCK_CONFIG.modules): boolean {
  return MOCK_CONFIG.enabled && MOCK_CONFIG.modules[module];
}

