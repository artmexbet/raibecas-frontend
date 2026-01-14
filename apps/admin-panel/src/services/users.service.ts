import type {CreateAdminRequest} from "@/types/auth.ts";
import type {User} from "@/types";
import {API_ENDPOINTS} from "@/constants/api.ts";
import apiClient from "@/services/api.ts";
import {isMockEnabled, registrationRequestsMockHandlers, usersMockHandlers} from "@/mocks";

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
    },

    async fetchUsers() {
        let response: { data: User[] };

        // Используем моки если они включены
        if (isMockEnabled('users')) {
            const mockData = await usersMockHandlers.getAll();
            response = {data: mockData};
        } else {
            // Реальный API запрос
            response = await apiClient.get<User[]>(
                API_ENDPOINTS.USERS.LIST
            );
        }

        return response.data;
    },

    async toggleUserStatus(userId: string, isActive: boolean) {
        if (isMockEnabled('users')) {
            if (isActive) {
                return await usersMockHandlers.activate(userId);
            } else {
                return await usersMockHandlers.deactivate(userId);
            }
        } else {
            const response = await apiClient.patch<User>(
                API_ENDPOINTS.USERS.UPDATE(userId),
                { isActive }
            );
            return response.data;
        }
    }
}