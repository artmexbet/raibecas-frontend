import apiClient from '@/services/api';
import { API_ENDPOINTS } from '@/constants/api';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

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
};

