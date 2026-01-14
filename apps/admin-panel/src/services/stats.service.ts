import apiClient from './api';
import { statsMockHandlers, type DashboardStats, MOCK_CONFIG } from '@/mocks';

/**
 * Сервис для работы со статистикой
 */
class StatsService {
  /**
   * Получить статистику для Dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    if (MOCK_CONFIG.enabled) {
      return statsMockHandlers.getDashboardStats();
    }

    const response = await apiClient.get<DashboardStats>('/api/admin/stats/dashboard');
    return response.data;
  }
}

export const statsService = new StatsService();
