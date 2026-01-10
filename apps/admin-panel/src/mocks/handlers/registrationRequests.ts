import { mockApiCall } from '@/mocks';
import {
  MOCK_REGISTRATION_REQUESTS,
  createMockRegistrationRequest,
  RequestStatus,
  type RegistrationRequest,
} from '@/mocks';

/**
 * Моковые обработчики для заявок на регистрацию
 */
export const registrationRequestsMockHandlers = {
  /**
   * Получить список всех заявок
   */
  async getAll(): Promise<RegistrationRequest[]> {
    const result = await mockApiCall([...MOCK_REGISTRATION_REQUESTS]);
    return result.data;
  },

  /**
   * Получить только ожидающие заявки
   */
  async getPending(): Promise<RegistrationRequest[]> {
    const pending = MOCK_REGISTRATION_REQUESTS.filter(
      r => r.status === RequestStatus.PENDING
    );
    const result = await mockApiCall(pending);
    return result.data;
  },

  /**
   * Получить заявку по ID
   */
  async getById(id: string): Promise<RegistrationRequest> {
    const request = MOCK_REGISTRATION_REQUESTS.find(r => r.id === id);

    if (!request) {
      throw new Error('Registration request not found');
    }

    const result = await mockApiCall(request);
    return result.data;
  },

  /**
   * Одобрить заявку
   */
  async approve(id: string, reviewedBy: string): Promise<RegistrationRequest> {
    const index = MOCK_REGISTRATION_REQUESTS.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error('Registration request not found');
    }

    const baseRequest = MOCK_REGISTRATION_REQUESTS[index]!;
    const updatedRequest: RegistrationRequest = {
      id: baseRequest.id,
      email: baseRequest.email,
      username: baseRequest.username,
      fullName: baseRequest.fullName,
      reason: baseRequest.reason,
      status: RequestStatus.APPROVED,
      createdAt: baseRequest.createdAt,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };

    MOCK_REGISTRATION_REQUESTS[index] = updatedRequest;

    const result = await mockApiCall(updatedRequest, 1000);
    return result.data;
  },

  /**
   * Отклонить заявку
   */
  async reject(id: string, reviewedBy: string): Promise<RegistrationRequest> {
    const index = MOCK_REGISTRATION_REQUESTS.findIndex(r => r.id === id);

    if (index === -1) {
      throw new Error('Registration request not found');
    }

    const baseRequest = MOCK_REGISTRATION_REQUESTS[index]!;
    const updatedRequest: RegistrationRequest = {
      id: baseRequest.id,
      email: baseRequest.email,
      username: baseRequest.username,
      fullName: baseRequest.fullName,
      reason: baseRequest.reason,
      status: RequestStatus.REJECTED,
      createdAt: baseRequest.createdAt,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    };

    MOCK_REGISTRATION_REQUESTS[index] = updatedRequest;

    const result = await mockApiCall(updatedRequest, 1000);
    return result.data;
  },

  /**
   * Создать новую заявку (для тестирования)
   */
  async create(data: Partial<RegistrationRequest>): Promise<RegistrationRequest> {
    const newRequest = createMockRegistrationRequest(data);
    MOCK_REGISTRATION_REQUESTS.push(newRequest);

    const result = await mockApiCall(newRequest, 800);
    return result.data;
  },
};

