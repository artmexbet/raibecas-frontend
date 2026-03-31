import apiClient from './api';
import { API_ENDPOINTS } from '@/constants/api';
import { getMockBookmarks } from '@/mocks/bookmarks';
import type { ListBookmarksQuery, ListBookmarksResponse } from '@/types/bookmark';

/**
 * До реализации обработчика на бэкенде страница использует локальный мок.
 * Когда API будет готово, достаточно переключить флаг на false.
 */
const USE_MOCK_BOOKMARKS = true;

export const bookmarkService = {
  async getAll(query?: ListBookmarksQuery): Promise<ListBookmarksResponse> {
    if (USE_MOCK_BOOKMARKS) {
      return getMockBookmarks(query);
    }

    const response = await apiClient.get<ListBookmarksResponse>(API_ENDPOINTS.BOOKMARKS.LIST, {
      params: query,
    });

    return response.data;
  },
};

