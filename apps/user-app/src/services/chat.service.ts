import apiClient from '@/services/api';
import { API_ENDPOINTS, CHAT_WS_BASE_URL } from '@/constants/api';
import type { ChatSession } from '@/types/chat';

export const chatService = {
  async getUserSessions(userID: string): Promise<ChatSession[]> {
    const response = await apiClient.get<ChatSession[]>(API_ENDPOINTS.CHAT.SESSIONS(userID));
    return response.data ?? [];
  },

  async createSession(userID: string, title?: string): Promise<string> {
    const response = await apiClient.post<{ session_id: string }>(
      API_ENDPOINTS.CHAT.SESSIONS(userID),
      { title: title ?? 'Новый чат' },
    );

    return response.data.session_id;
  },

  buildWebSocketURL(userID: string, accessToken?: string | null): string {
    const url = new URL(`${CHAT_WS_BASE_URL}/${userID}`);

    if (accessToken) {
      url.searchParams.set('token', accessToken);
    }

    return url.toString();
  },
};
