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
  fullName: string;
  reason: string; // Причина регистрации
  status: RequestStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // ID администратора
}

/**
 * Моковые данные заявок на регистрацию
 */
export const MOCK_REGISTRATION_REQUESTS: RegistrationRequest[] = [
  {
    id: '1',
    email: 'new.user1@example.com',
    username: 'new_user1',
    fullName: 'Дмитрий Соколов',
    reason: 'Аспирант МГУ, изучаю философию науки',
    status: RequestStatus.PENDING,
    createdAt: '2026-01-09T10:30:00.000Z',
  },
  {
    id: '2',
    email: 'researcher@university.edu',
    username: 'researcher_42',
    fullName: 'Анна Козлова',
    reason: 'Научный сотрудник института философии, исследую феноменологию',
    status: RequestStatus.PENDING,
    createdAt: '2026-01-08T14:20:00.000Z',
  },
  {
    id: '3',
    email: 'student@philosophy.edu',
    username: 'phil_student',
    fullName: 'Петр Морозов',
    reason: 'Студент 4 курса философского факультета',
    status: RequestStatus.APPROVED,
    createdAt: '2026-01-05T09:15:00.000Z',
    reviewedAt: '2026-01-06T11:30:00.000Z',
    reviewedBy: '1',
  },
  {
    id: '4',
    email: 'random@mail.com',
    username: 'random123',
    fullName: 'Test User',
    reason: 'Just curious',
    status: RequestStatus.REJECTED,
    createdAt: '2026-01-04T16:45:00.000Z',
    reviewedAt: '2026-01-04T18:00:00.000Z',
    reviewedBy: '1',
  },
];

/**
 * Создает новую моковую заявку
 */
export function createMockRegistrationRequest(
  data: Partial<RegistrationRequest>
): RegistrationRequest {
  return {
    id: String(MOCK_REGISTRATION_REQUESTS.length + 1),
    email: data.email || 'user@example.com',
    username: data.username || 'user',
    fullName: data.fullName || 'User Name',
    reason: data.reason || 'No reason provided',
    status: RequestStatus.PENDING,
    createdAt: new Date().toISOString(),
  };
}

