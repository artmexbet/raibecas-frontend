/**
 * Типы для заявок на регистрацию
 */

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface RegistrationRequest {
  id: string;
  email: string;
  username: string;
  status: RequestStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

/**
 * Моковые данные заявок на регистрацию
 */
export const MOCK_REGISTRATION_REQUESTS: RegistrationRequest[] = [
  {
    id: '1',
    email: 'new.user1@example.com',
    username: 'new_user1',
    status: RequestStatus.PENDING,
    metadata: {
      fullName: 'Дмитрий Соколов',
      reason: 'Аспирант МГУ, изучаю философию науки'
    },
    createdAt: '2026-01-09T10:30:00.000Z',
    updatedAt: '2026-01-09T10:30:00.000Z',
  },
  {
    id: '2',
    email: 'researcher@university.edu',
    username: 'researcher_42',
    status: RequestStatus.PENDING,
    metadata: {
      fullName: 'Анна Козлова',
      reason: 'Научный сотрудник института философии, исследую феноменологию'
    },
    createdAt: '2026-01-08T14:20:00.000Z',
    updatedAt: '2026-01-08T14:20:00.000Z',
  },
  {
    id: '3',
    email: 'student@philosophy.edu',
    username: 'phil_student',
    status: RequestStatus.APPROVED,
    metadata: {
      fullName: 'Петр Морозов',
      reason: 'Студент 4 курса философского факультета'
    },
    createdAt: '2026-01-05T09:15:00.000Z',
    updatedAt: '2026-01-06T11:30:00.000Z',
    approvedAt: '2026-01-06T11:30:00.000Z',
    approvedBy: '1',
  },
  {
    id: '4',
    email: 'random@mail.com',
    username: 'random123',
    status: RequestStatus.REJECTED,
    metadata: {
      fullName: 'Test User',
      rejection_reason: 'Недостаточно информации для проверки'
    },
    createdAt: '2026-01-04T16:45:00.000Z',
    updatedAt: '2026-01-04T18:00:00.000Z',
    approvedAt: '2026-01-04T18:00:00.000Z',
    approvedBy: '1',
  },
];

/**
 * Создает новую моковую заявку
 */
export function createMockRegistrationRequest(
  data: Partial<RegistrationRequest>
): RegistrationRequest {
  const now = new Date().toISOString();
  return {
    id: String(MOCK_REGISTRATION_REQUESTS.length + 1),
    email: data.email || 'user@example.com',
    username: data.username || 'user',
    status: data.status || RequestStatus.PENDING,
    metadata: data.metadata,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    approvedBy: data.approvedBy,
    approvedAt: data.approvedAt,
  };
}

