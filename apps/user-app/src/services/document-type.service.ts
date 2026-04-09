import apiClient from './api';
import { API_ENDPOINTS } from '@/constants/api';
import type { DocumentType } from '@/types/document';

export const documentTypeService = {
  async getAll(): Promise<DocumentType[]> {
    const response = await apiClient.get<{ documentTypes: DocumentType[] }>(API_ENDPOINTS.DOCUMENT_TYPES.LIST);
    return response.data.documentTypes;
  },
};

