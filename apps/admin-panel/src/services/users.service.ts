import type {CreateAdminRequest} from "@/types/auth.ts";
import type {User} from "@/types";
import {API_ENDPOINTS} from "@/constants/api.ts";
import apiClient from "@/services/api.ts";
import {isMockEnabled, registrationRequestsMockHandlers, usersMockHandlers} from "@/mocks";
import {AdminRole} from "@/types/permissions.ts";

export const usersService = {
    async fetchRegistrationRequests(status?: string, page: number = 1, pageSize: number = 10) {
        // Используем моки если они включены
        if (isMockEnabled('registrationRequests')) {
            return await registrationRequestsMockHandlers.getAll(status, page, pageSize);
        } else {
            // Реальный API запрос
            const params = new URLSearchParams({
                page: page.toString(),
                page_size: pageSize.toString(),
                ...(status && { status })
            });
            const response = await apiClient.get<{ requests: CreateAdminRequest[], total_count: number, page: number, page_size: number }>(
                `${API_ENDPOINTS.REGISTRATION_REQUESTS.LIST}?${params.toString()}`
            );
            // Сервер возвращает {requests: [], total_count: 0, page: 1, page_size: 10}
            // Axios оборачивает это в response.data
            return response.data;
        }
    },

    async approve(requestId: string, role: AdminRole) {
        if (isMockEnabled('registrationRequests')) {
            // Получаем ID текущего администратора (в реальной ситуации из контекста)
            await registrationRequestsMockHandlers.approve(requestId, 'current-admin-id');
        } else {
            await apiClient.post(
                API_ENDPOINTS.REGISTRATION_REQUESTS.APPROVE(requestId),
                { role }
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
        // Используем моки если они включены
        if (isMockEnabled('users')) {
            return await usersMockHandlers.getAll();
        } else {
            // Реальный API запрос
            const response = await apiClient.get<{ users: User[], total_count: number, page: number, page_size: number }>(
                API_ENDPOINTS.USERS.LIST
            );
            // Сервер возвращает {users: [], total_count: 0, page: 1, page_size: 10}
            // Axios оборачивает это в response.data
            return response.data.users;
        }
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
                { is_active: isActive }
            );
            return response.data;
        }
    },

    async updateUser(userId: string, data: Partial<User>) {
        if (isMockEnabled('users')) {
            return await usersMockHandlers.update(userId, data);
        } else {
            const response = await apiClient.patch<User>(
                API_ENDPOINTS.USERS.UPDATE(userId),
                data
            );
            return response.data;
        }
    }
}