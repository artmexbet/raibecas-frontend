import apiClient from './api';
import {isMockEnabled, documentsMockHandlers } from "@/mocks";
import { API_ENDPOINTS } from '../constants/api';
import type {
    Document,
    ListDocumentsQuery,
    ListDocumentsResponse,
    CreateDocumentRequest,
    CreateDocumentResponse,
    GetDocumentResponse,
    UpdateDocumentRequest,
    UpdateDocumentResponse
} from "@/types/document.ts";


export const documentService = {
    // Получить список документов с пагинацией и фильтрацией
    async getAll(query?: ListDocumentsQuery): Promise<ListDocumentsResponse> {
        let response: { data: ListDocumentsResponse };

        // Используем моки если они включены
        if (isMockEnabled('documents')) {
            const mockData = await documentsMockHandlers.getAll();
            response = {
                data: {
                    documents: mockData,
                    total: mockData.length,
                    page: query?.page || 1,
                    limit: query?.limit || 20,
                    totalPages: Math.ceil(mockData.length / (query?.limit || 20))
                }
            };
        } else {
            // Реальный API запрос
            response = await apiClient.get<ListDocumentsResponse>(API_ENDPOINTS.DOCUMENTS.LIST, {
                params: query
            });
        }

        return response.data;
    },

    // Получить документ по ID
    async getById(id: string): Promise<Document> {
        let response: { data: GetDocumentResponse };

        if (isMockEnabled('documents')) {
            const mockData = await documentsMockHandlers.getById(id);
            response = { data: { document: mockData } };
        } else {
            response = await apiClient.get<GetDocumentResponse>(`${API_ENDPOINTS.DOCUMENTS.LIST}/${id}`);
        }

        return response.data.document;
    },

    // Создать новый документ
    async create(data: CreateDocumentRequest): Promise<Document> {
        let response: { data: CreateDocumentResponse };

        if (isMockEnabled('documents')) {
            const mockData = await documentsMockHandlers.create(data);
            response = { data: { document: mockData } };
        } else {
            response = await apiClient.post<CreateDocumentResponse>(API_ENDPOINTS.DOCUMENTS.LIST, data);
        }

        return response.data.document;
    },

    // Обновить документ
    async update(id: string, data: UpdateDocumentRequest): Promise<Document> {
        let response: { data: UpdateDocumentResponse };

        if (isMockEnabled('documents')) {
            const mockData = await documentsMockHandlers.update(id, data);
            response = { data: { document: mockData } };
        } else {
            response = await apiClient.put<UpdateDocumentResponse>(`${API_ENDPOINTS.DOCUMENTS.LIST}/${id}`, data);
        }

        return response.data.document;
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