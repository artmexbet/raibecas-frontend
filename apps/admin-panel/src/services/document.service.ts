import apiClient from './api';
import {isMockEnabled, documentsMockHandlers } from "@/mocks";
import { API_ENDPOINTS } from '../constants/api';
import type {Document} from "@/types/document.ts";


export const documentService = {
    // Получить список документов
    async getAll(): Promise<Document[]> {
        let response: { data: Document[] };

        // Используем моки если они включены
        if (isMockEnabled('documents')) {
            const mockData = await documentsMockHandlers.getAll();
            response = {data: mockData};
        } else {
            // Реальный API запрос
            response = await apiClient.get<Document[]>(API_ENDPOINTS.DOCUMENTS.LIST);
        }

        return response.data;
    },

    // Получить документ по ID
    async getById(id: string): Promise<Document> {
        let response: { data: Document };

        if (isMockEnabled('documents')) {
            const mockData = await documentsMockHandlers.getById(id);
            response = {data: mockData};
        } else {
            response = await apiClient.get<Document>(`${API_ENDPOINTS.DOCUMENTS.LIST}/${id}`);
        }

        return response.data;
    },

    // Создать новый документ
    async create(data: Partial<Document>): Promise<Document> {
        let response: { data: Document };

        if (isMockEnabled('documents')) {
            const mockData = await documentsMockHandlers.create(data);
            response = {data: mockData};
        } else {
            response = await apiClient.post<Document>(API_ENDPOINTS.DOCUMENTS.LIST, data);
        }

        return response.data;
    },

    // Обновить документ
    async update(id: string, data: Partial<Document>): Promise<Document> {
        let response: { data: Document };

        if (isMockEnabled('documents')) {
            const mockData = await documentsMockHandlers.update(id, data);
            response = {data: mockData};
        } else {
            response = await apiClient.put<Document>(`${API_ENDPOINTS.DOCUMENTS.LIST}/${id}`, data);
        }

        return response.data;
    },

    // Удалить документ
    async delete(id: string): Promise<void> {
        if (isMockEnabled('documents')) {
            await documentsMockHandlers.delete(id);
        } else {
            await apiClient.delete(`${API_ENDPOINTS.DOCUMENTS.LIST}/${id}`);
        }
    },
}