import apiClient from './api';
import { isMockEnabled, MOCK_AUTHORSHIP_TYPES } from '@/mocks';
import { API_ENDPOINTS } from '../constants/api';
import type { AuthorshipType } from '@/types/document';

export const authorshipTypeService = {
    async getAll(): Promise<AuthorshipType[]> {
        if (isMockEnabled('documents')) {
            return Promise.resolve(MOCK_AUTHORSHIP_TYPES);
        }
        const response = await apiClient.get<{ authorshipTypes: AuthorshipType[] }>(API_ENDPOINTS.AUTHORSHIP_TYPES.LIST);
        return response.data.authorshipTypes;
    },
};


