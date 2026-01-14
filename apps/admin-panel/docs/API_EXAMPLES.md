# Примеры использования API

Этот файл содержит практические примеры использования Raibecas Admin API.

## Содержание

- [Аутентификация](#аутентификация)
- [Работа с документами](#работа-с-документами)
- [Управление пользователями](#управление-пользователями)
- [Заявки на регистрацию](#заявки-на-регистрацию)
- [Статистика](#статистика)
- [Обработка ошибок](#обработка-ошибок)

---

## Аутентификация

### Вход в систему

**JavaScript/TypeScript:**

```typescript
import { authService } from './services/auth.service';

async function login() {
  try {
    const response = await authService.login({
      email: 'admin@raibecas.kz',
      password: 'SecurePassword123!',
      remember: true
    });
    
    console.log('Токен:', response.token);
    console.log('Администратор:', response.admin);
  } catch (error) {
    console.error('Ошибка входа:', error);
  }
}
```

**cURL:**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@raibecas.kz",
    "password": "SecurePassword123!"
  }'
```

**Ответ:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@raibecas.kz",
    "username": "admin",
    "role": "super_admin",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Получение текущего администратора

**TypeScript:**

```typescript
async function getCurrentAdmin() {
  try {
    const admin = await authService.getCurrentAdmin();
    console.log('Текущий администратор:', admin);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Выход из системы

**TypeScript:**

```typescript
async function logout() {
  try {
    await authService.logout();
    console.log('Выход выполнен успешно');
  } catch (error) {
    console.error('Ошибка выхода:', error);
  }
}
```

---

## Работа с документами

### Получение списка документов

**TypeScript:**

```typescript
import { documentService } from './services/document.service';

async function getDocuments() {
  try {
    const documents = await documentService.getAll();
    console.log('Найдено документов:', documents.length);
    documents.forEach(doc => {
      console.log(`- ${doc.title} (${doc.author})`);
    });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
  }
}
```

**cURL с фильтрацией:**

```bash
# Поиск по тексту
curl -X GET "http://localhost:8080/api/documents?search=Кант" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Фильтр по категории
curl -X GET "http://localhost:8080/api/documents?category=Эпистемология" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Пагинация
curl -X GET "http://localhost:8080/api/documents?page=2&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Получение документа по ID

**TypeScript:**

```typescript
async function getDocument(id: string) {
  try {
    const document = await documentService.getById(id);
    console.log('Документ:', document.title);
    console.log('Содержимое:', document.content);
  } catch (error) {
    console.error('Документ не найден:', error);
  }
}

// Использование
getDocument('doc-001');
```

**cURL:**

```bash
curl -X GET http://localhost:8080/api/documents/doc-001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Создание нового документа

**TypeScript:**

```typescript
async function createDocument() {
  try {
    const newDoc = await documentService.create({
      title: 'Бытие и время',
      description: 'Фундаментальная онтология Мартина Хайдеггера',
      content: `# Введение

Основные положения фундаментальной онтологии...

## Бытие и сущее

Раскрытие смысла бытия...`,
      author: 'Мартин Хайдеггер',
      category: 'Онтология',
      publicationDate: '1927-01-01',
      tags: ['философия', 'хайдеггер', 'онтология', 'бытие']
    });
    
    console.log('Создан документ:', newDoc.id);
  } catch (error) {
    console.error('Ошибка создания:', error);
  }
}
```

**cURL:**

```bash
curl -X POST http://localhost:8080/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Бытие и время",
    "description": "Фундаментальная онтология",
    "content": "# Введение\n\n...",
    "author": "Мартин Хайдеггер",
    "category": "Онтология",
    "publicationDate": "1927-01-01",
    "tags": ["философия", "хайдеггер", "онтология"]
  }'
```

### Обновление документа

**TypeScript:**

```typescript
async function updateDocument(id: string) {
  try {
    const updated = await documentService.update(id, {
      description: 'Обновленное описание',
      tags: ['новый-тег', 'философия']
    });
    
    console.log('Документ обновлен:', updated.updatedAt);
  } catch (error) {
    console.error('Ошибка обновления:', error);
  }
}
```

**cURL:**

```bash
curl -X PUT http://localhost:8080/api/documents/doc-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Обновленное описание",
    "tags": ["новый-тег", "философия"]
  }'
```

### Удаление документа

**TypeScript:**

```typescript
async function deleteDocument(id: string) {
  try {
    await documentService.delete(id);
    console.log('Документ удален');
  } catch (error) {
    console.error('Ошибка удаления:', error);
  }
}
```

**cURL:**

```bash
curl -X DELETE http://localhost:8080/api/documents/doc-001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Управление пользователями

### Получение списка пользователей

**TypeScript:**

```typescript
import { usersService } from './services/users.service';

async function getUsers() {
  try {
    const users = await usersService.fetchUsers();
    console.log('Всего пользователей:', users.length);
    
    // Активные пользователи
    const active = users.filter(u => u.isActive);
    console.log('Активных:', active.length);
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

**cURL с фильтрами:**

```bash
# Только активные пользователи
curl -X GET "http://localhost:8080/api/users?isActive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Поиск по имени
curl -X GET "http://localhost:8080/api/users?search=Ivan" \
  -H "Authorization: Bearer YOUR_TOKEN"

# С пагинацией
curl -X GET "http://localhost:8080/api/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Деактивация пользователя

**TypeScript:**

```typescript
async function deactivateUser(userId: string) {
  try {
    await usersService.toggleUserStatus(userId, false);
    console.log('Пользователь деактивирован');
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

**cURL:**

```bash
curl -X PATCH http://localhost:8080/api/users/user-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

### Активация пользователя

**TypeScript:**

```typescript
async function activateUser(userId: string) {
  try {
    await usersService.toggleUserStatus(userId, true);
    console.log('Пользователь активирован');
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

---

## Заявки на регистрацию

### Получение списка заявок

**TypeScript:**

```typescript
async function getRegistrationRequests() {
  try {
    const requests = await usersService.fetchRegistrationRequests();
    console.log('Ожидающих заявок:', requests.length);
    
    requests.forEach(req => {
      console.log(`- ${req.username} (${req.email})`);
      console.log(`  Заявка: ${req.request}`);
    });
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:8080/api/registration-requests \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Одобрение заявки

**TypeScript:**

```typescript
async function approveRequest(requestId: string) {
  try {
    await usersService.approve(requestId);
    console.log('Заявка одобрена, пользователь создан');
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

**cURL:**

```bash
curl -X POST http://localhost:8080/api/registration-requests/req-001/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Отклонение заявки

**TypeScript:**

```typescript
async function rejectRequest(requestId: string, reason?: string) {
  try {
    await usersService.reject(requestId);
    console.log('Заявка отклонена');
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

**cURL (с причиной):**

```bash
curl -X POST http://localhost:8080/api/registration-requests/req-001/reject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Недостаточно информации"}'
```

---

## Статистика

### Получение статистики Dashboard

**TypeScript:**

```typescript
import { statsService } from './services/stats.service';

async function getDashboardStats() {
  try {
    const stats = await statsService.getDashboardStats();
    
    console.log('Документов:', stats.documentsCount);
    console.log('Пользователей:', stats.usersCount);
    console.log('Заявок:', stats.pendingRequestsCount);
    console.log('Заметок:', stats.totalNotesCount);
    
    console.log('\nПоследние документы:');
    stats.recentDocuments.forEach(doc => {
      console.log(`- ${doc.title} (${doc.author})`);
    });
    
    console.log('\nПоследние пользователи:');
    stats.recentUsers.forEach(user => {
      console.log(`- ${user.username}`);
    });
  } catch (error) {
    console.error('Ошибка:', error);
  }
}
```

**cURL:**

```bash
curl -X GET http://localhost:8080/api/admin/stats/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Ответ:**

```json
{
  "documentsCount": 147,
  "usersCount": 89,
  "pendingRequestsCount": 5,
  "totalNotesCount": 342,
  "recentDocuments": [
    {
      "id": "doc-001",
      "title": "Критика чистого разума",
      "author": "Иммануил Кант",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "recentUsers": [
    {
      "id": "user-004",
      "username": "elena_v",
      "registeredAt": "2024-04-05T12:30:00.000Z"
    }
  ]
}
```

---

## Обработка ошибок

### Типичные ошибки и их обработка

**TypeScript:**

```typescript
import { AxiosError } from 'axios';

async function safeApiCall() {
  try {
    const result = await documentService.getAll();
    return result;
  } catch (error) {
    if (error instanceof AxiosError) {
      switch (error.response?.status) {
        case 401:
          console.error('Не авторизован - требуется вход');
          // Редирект на страницу входа
          window.location.href = '/login';
          break;
          
        case 403:
          console.error('Недостаточно прав доступа');
          break;
          
        case 404:
          console.error('Ресурс не найден');
          break;
          
        case 422:
          console.error('Ошибка валидации:', error.response?.data);
          break;
          
        case 500:
          console.error('Внутренняя ошибка сервера');
          break;
          
        default:
          console.error('Неизвестная ошибка:', error.message);
      }
    }
    throw error;
  }
}
```

### Формат ошибок API

```json
{
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": "Title is required",
    "author": "Author must be at least 2 characters"
  }
}
```

---

## Полезные утилиты

### Проверка авторизации

```typescript
function isAuthenticated(): boolean {
  return authService.isAuthenticated();
}

function getStoredAdmin() {
  return authService.getStoredAdmin();
}
```

### Форматирование дат

```typescript
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

### Работа с токеном

```typescript
function getAuthHeader(): { Authorization: string } | {} {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
```

---

## Интеграция с React компонентами

### Использование в компонентах

```typescript
import { useEffect, useState } from 'react';
import { documentService } from './services/document.service';
import { Document } from './types/document';

function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadDocuments();
  }, []);
  
  async function loadDocuments() {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) return <div>Загрузка...</div>;
  
  return (
    <div>
      {documents.map(doc => (
        <div key={doc.id}>{doc.title}</div>
      ))}
    </div>
  );
}
```

---

## Дополнительные ресурсы

- [Полная спецификация API](./api-swagger.yaml)
- [Swagger UI](./index.html) - интерактивная документация
- [Основная документация](./API_DOCUMENTATION.md)
