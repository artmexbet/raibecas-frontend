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
   * Получить список всех заявок с пагинацией и фильтром
   */
  async getAll(status?: string, page: number = 1, pageSize: number = 10): Promise<{requests: RegistrationRequest[], total_count: number, page: number, page_size: number}> {
    let filtered = [...MOCK_REGISTRATION_REQUESTS];
    if (status && status !== '') {
      filtered = filtered.filter(r => r.status === status);
    }

    const total = filtered.length;
    const offset = (page - 1) * pageSize;
    const paginated = filtered.slice(offset, offset + pageSize);

    const result = await mockApiCall({
      requests: paginated,
      total_count: total,
      page,
      page_size: pageSize
    });
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
    const now = new Date().toISOString();
    const updatedRequest: RegistrationRequest = {
      id: baseRequest.id,
      email: baseRequest.email,
      username: baseRequest.username,
      metadata: baseRequest.metadata,
      status: RequestStatus.APPROVED,
      createdAt: baseRequest.createdAt,
      updatedAt: now,
      approvedAt: now,
      approvedBy: reviewedBy,
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
    const now = new Date().toISOString();
    const updatedRequest: RegistrationRequest = {
      id: baseRequest.id,
      email: baseRequest.email,
      username: baseRequest.username,
      metadata: {
        ...baseRequest.metadata,
        rejection_reason: 'Заявка отклонена администратором'
      },
      status: RequestStatus.REJECTED,
      createdAt: baseRequest.createdAt,
      updatedAt: now,
      approvedAt: now,
      approvedBy: reviewedBy,
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

