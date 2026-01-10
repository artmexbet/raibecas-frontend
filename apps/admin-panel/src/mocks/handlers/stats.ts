import { mockApiCall } from '@/mocks';
import { MOCK_STATS, type DashboardStats } from '@/mocks';

/**
 * Моковые обработчики для статистики
 */
export const statsMockHandlers = {
  /**
   * Получить статистику для Dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const result = await mockApiCall(MOCK_STATS);
    return result.data;
  },
};

