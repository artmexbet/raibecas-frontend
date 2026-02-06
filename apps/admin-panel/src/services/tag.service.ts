import apiClient from './api';
import { isMockEnabled, MOCK_TAGS } from '@/mocks';
import { API_ENDPOINTS } from '../constants/api';
import type { Tag } from '@/types/document';

export interface CreateTagRequest {
    title: string;
}

export const tagService = {
    async getAll(): Promise<Tag[]> {
        if (isMockEnabled('documents')) {
            return Promise.resolve(MOCK_TAGS);
        }
        const response = await apiClient.get<Tag[]>(API_ENDPOINTS.TAGS.LIST);
        return response.data;
    },

    async create(data: CreateTagRequest): Promise<Tag> {
        if (isMockEnabled('documents')) {
            const newTag: Tag = {
                id: MOCK_TAGS.length + 1,
                title: data.title,
            };
            MOCK_TAGS.push(newTag);
            return Promise.resolve(newTag);
        }
        const response = await apiClient.post<Tag>(API_ENDPOINTS.TAGS.CREATE, data);
        return response.data;
    },
};
