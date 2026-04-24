import apiClient from './api';
import { isMockEnabled, MOCK_DOCUMENT_TYPES } from '@/mocks';
import { API_ENDPOINTS } from '../constants/api';
import type { DocumentType } from '@/types/document';

export const documentTypeService = {
    async getAll(): Promise<DocumentType[]> {
        if (isMockEnabled('documents')) {
            return Promise.resolve(MOCK_DOCUMENT_TYPES);
        }
        const response = await apiClient.get<{ documentTypes: DocumentType[] }>(
            API_ENDPOINTS.DOCUMENT_TYPES.LIST,
        );
        return response.data.documentTypes;
    },
};
