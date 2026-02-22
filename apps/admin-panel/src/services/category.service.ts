import apiClient from './api';
import { isMockEnabled, MOCK_CATEGORIES } from '@/mocks';
import { API_ENDPOINTS } from '../constants/api';
import type { Category } from '@/types/document';

export interface CreateCategoryRequest {
    title: string;
}

export const categoryService = {
    async getAll(): Promise<Category[]> {
        if (isMockEnabled('documents')) {
            return Promise.resolve(MOCK_CATEGORIES);
        }
        const response = await apiClient.get<{ categories: Category[] }>(API_ENDPOINTS.CATEGORIES.LIST);
        return response.data.categories;
    },

    async create(data: CreateCategoryRequest): Promise<Category> {
        if (isMockEnabled('documents')) {
            const newCategory: Category = {
                id: MOCK_CATEGORIES.length + 1,
                title: data.title,
            };
            MOCK_CATEGORIES.push(newCategory);
            return Promise.resolve(newCategory);
        }
        const response = await apiClient.post<{ category: Category }>(API_ENDPOINTS.CATEGORIES.CREATE, data);
        return response.data.category;
    },
};
