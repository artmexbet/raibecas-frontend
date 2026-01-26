import { mockApiCall, MOCK_USERS } from '@/mocks';
import type {User} from "@/types";

/**
 * Моковые обработчики для пользователей
 */
export const usersMockHandlers = {
  /**
   * Получить список пользователей
   */
  async getAll(): Promise<User[]> {
    const result = await mockApiCall([...MOCK_USERS]);
    return result.data;
  },

  /**
   * Получить пользователя по ID
   */
  async getById(id: string): Promise<User> {
    const user = MOCK_USERS.find(u => u.id === id);

    if (!user) {
      throw new Error('User not found');
    }

    const result = await mockApiCall(user);
    return result.data;
  },

  /**
   * Обновить пользователя
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    const index = MOCK_USERS.findIndex(u => u.id === id);

    if (index === -1) {
      throw new Error('User not found');
    }

    const baseUser = MOCK_USERS[index]!;
    const updatedUser: User = {
      id: baseUser.id,
      email: data.email ?? baseUser.email,
      username: data.username ?? baseUser.username,
      fullName: data.fullName ?? baseUser.fullName,
      registeredAt: baseUser.registeredAt,
      lastLoginAt: data.lastLoginAt ?? baseUser.lastLoginAt,
      isActive: data.isActive ?? baseUser.isActive,
    };

    MOCK_USERS[index] = updatedUser;

    const result = await mockApiCall(updatedUser, 800);
    return result.data;
  },

  /**
   * Удалить пользователя
   */
  async delete(id: string): Promise<void> {
    const index = MOCK_USERS.findIndex(u => u.id === id);

    if (index === -1) {
      throw new Error('User not found');
    }

    MOCK_USERS.splice(index, 1);

    await mockApiCall(undefined, 600);
  },

  /**
   * Деактивировать пользователя
   */
  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false });
  },

  /**
   * Активировать пользователя
   */
  async activate(id: string): Promise<User> {
    return this.update(id, { isActive: true });
  },
};

