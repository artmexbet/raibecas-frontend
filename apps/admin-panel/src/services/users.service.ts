import type {CreateAdminRequest} from "@/types/auth.ts";
import {API_ENDPOINTS} from "@/constants/api.ts";
import apiClient from "@/services/api.ts";
import {isMockEnabled, registrationRequestsMockHandlers} from "@/mocks";

export const usersService = {
    async fetchRegistrationRequests() {
        let response: { data: CreateAdminRequest[] };

        // Используем моки если они включены
        if (isMockEnabled('registrationRequests')) {
            const mockData = await registrationRequestsMockHandlers.getAll();
            response = {data: mockData as unknown as CreateAdminRequest[]};
        } else {
            // Реальный API запрос
            response = await apiClient.get<CreateAdminRequest[]>(
                API_ENDPOINTS.REGISTRATION_REQUESTS.LIST
            );
        }

        return response.data;
    },

    async approve(requestId: string) {
        if (isMockEnabled('registrationRequests')) {
            // Получаем ID текущего администратора (в реальной ситуации из контекста)
            await registrationRequestsMockHandlers.approve(requestId, 'current-admin-id');
        } else {
            await apiClient.post(
                API_ENDPOINTS.REGISTRATION_REQUESTS.APPROVE(requestId)
            );
        }
    },

    async reject(requestId: string) {
        if (isMockEnabled('registrationRequests')) {
            // Получаем ID текущего администратора (в реальной ситуации из контекста)
            await registrationRequestsMockHandlers.reject(requestId, 'current-admin-id');
        } else {
            await apiClient.post(
                API_ENDPOINTS.REGISTRATION_REQUESTS.REJECT(requestId)
            );
        }
    }
}