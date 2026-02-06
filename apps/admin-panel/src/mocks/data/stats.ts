/**
 * Статистика для Dashboard
 */

export interface DashboardStats {
  documentsCount: number;
  usersCount: number;
  pendingRequestsCount: number;
  totalNotesCount: number;
  recentDocuments: Array<{
    id: string;
    title: string;
    author: string;
    created_at: string;
  }>;
  recentUsers: Array<{
    id: string;
    username: string;
    registeredAt: string;
  }>;
}

/**
 * Моковые данные статистики
 */
export const MOCK_STATS: DashboardStats = {
  documentsCount: 147,
  usersCount: 89,
  pendingRequestsCount: 5,
  totalNotesCount: 342,
  recentDocuments: [
    {
      id: '1',
      title: 'Критика чистого разума',
      author: 'Иммануил Кант',
      created_at: '2024-01-15T10:00:00.000Z',
    },
    {
      id: '2',
      title: 'Бытие и время',
      author: 'Мартин Хайдеггер',
      created_at: '2024-02-20T14:30:00.000Z',
    },
    {
      id: '3',
      title: 'Феноменология духа',
      author: 'Г.В.Ф. Гегель',
      created_at: '2024-03-05T11:20:00.000Z',
    },
  ],
  recentUsers: [
    {
      id: '4',
      username: 'elena_v',
      registeredAt: '2024-04-05T12:30:00.000Z',
    },
    {
      id: '3',
      username: 'alex_iv',
      registeredAt: '2024-03-20T14:15:00.000Z',
    },
    {
      id: '2',
      username: 'maria_s',
      registeredAt: '2024-02-15T10:00:00.000Z',
    },
  ],
};

