import apiClient from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  Document,
  ListDocumentsQuery,
  ListDocumentsResponse,
  GetDocumentResponse,
} from '@/types/document';

export const documentService = {
  async getAll(query?: ListDocumentsQuery): Promise<ListDocumentsResponse> {
    const response = await apiClient.get<ListDocumentsResponse>(API_ENDPOINTS.DOCUMENTS.LIST, {
      params: query,
    });
    return response.data;
  },

  async getById(id: string): Promise<Document> {
    const response = await apiClient.get<GetDocumentResponse>(API_ENDPOINTS.DOCUMENTS.BY_ID(id));
    return response.data.document;
  },

  /**
   * TODO: реализовать эндпоинт на бэкенде GET /documents/:id/content
   * Возвращает markdown-контент документа
   */
  async getContent(id: string): Promise<string> {
    const response = await apiClient.get<{ content: string }>(API_ENDPOINTS.DOCUMENTS.CONTENT(id));
    return response.data.content;
  },
};

