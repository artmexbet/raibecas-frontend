import apiClient from './api';
import { isMockEnabled, MOCK_AUTHORS } from '@/mocks';
import { API_ENDPOINTS } from '../constants/api';
import type { Author } from '@/types/document';

export interface CreateAuthorRequest {
    name: string;
}

export const authorService = {
    // Получить список всех авторов
    async getAll(): Promise<Author[]> {
        if (isMockEnabled('documents')) {
            return Promise.resolve(MOCK_AUTHORS);
        }

        const response = await apiClient.get<Author[]>(API_ENDPOINTS.AUTHORS.LIST);
        return response.data;
    },

    // Создать нового автора
    async create(data: CreateAuthorRequest): Promise<Author> {
        if (isMockEnabled('documents')) {
            const newAuthor: Author = {
                id: `temp-${Date.now()}`,
                name: data.name,
            };
            MOCK_AUTHORS.push(newAuthor);
            return Promise.resolve(newAuthor);
        }

        const response = await apiClient.post<Author>(API_ENDPOINTS.AUTHORS.CREATE, data);
        return response.data;
    },

    // Обновить автора
    async update(id: string, data: Partial<CreateAuthorRequest>): Promise<Author> {
        if (isMockEnabled('documents')) {
            const authorIndex = MOCK_AUTHORS.findIndex(a => a.id === id);
            if (authorIndex !== -1 && data.name) {
                MOCK_AUTHORS[authorIndex]!.name = data.name;
                return Promise.resolve(MOCK_AUTHORS[authorIndex]!);
            }
            throw new Error('Author not found');
        }

        const response = await apiClient.put<Author>(API_ENDPOINTS.AUTHORS.UPDATE(id), data);
        return response.data;
    },

    // Удалить автора
    async delete(id: string): Promise<void> {
        if (isMockEnabled('documents')) {
            const authorIndex = MOCK_AUTHORS.findIndex(a => a.id === id);
            if (authorIndex !== -1) {
                MOCK_AUTHORS.splice(authorIndex, 1);
            }
            return Promise.resolve();
        }

        await apiClient.delete(API_ENDPOINTS.AUTHORS.DELETE(id));
    },
};
