# API Documentation Update Summary

## Дата обновления
26 января 2026

## Общее описание
Обновлена OpenAPI спецификация (`api-swagger.yaml`) для соответствия реальной реализации Gateway API сервиса.

## Основные изменения

### 1. Аутентификация

#### Добавлены новые endpoints:
- `POST /api/v1/auth/refresh` - обновление access token через refresh token из cookie
- `POST /api/v1/auth/validate` - валидация access token
- `POST /api/v1/auth/logout-all` - выход из всех устройств
- `POST /api/v1/auth/change-password` - смена пароля

#### Обновлены существующие endpoints:
- `POST /api/v1/auth/login` - теперь возвращает `access_token` (вместо `token`), `token_type`, `expires_in` и объект `user`
- Refresh token теперь сохраняется в HttpOnly cookie автоматически
- Добавлена поддержка `deviceId` для отслеживания устройств

#### Удалены endpoints:
- `GET /api/v1/auth/me` - информация о пользователе теперь возвращается при логине

### 2. Документы

#### Изменения в структуре данных:
- `author` теперь объект `Author` с полями `id` (UUID) и `name` (вместо строки)
- `category` теперь объект `Category` с полями `id` (integer) и `title` (вместо строки)
- Добавлено поле `tags` - массив объектов `Tag` с полями `id` и `title`
- Добавлены поля `createdAt` и `updatedAt` (формат date-time)
- Удалено поле `content` (содержимое хранится отдельно)

#### Изменения в endpoints:
- `PATCH /api/v1/documents/:id` вместо `PUT` - теперь поддерживается частичное обновление
- Все ID теперь UUID формата
- В параметрах запроса:
  - `authorId` вместо `author` (UUID)
  - `categoryId` вместо `category` (integer)
  - `tagId` для фильтрации по тегу (integer)
  - `tagIds` в теле запроса (массив integer)

#### Изменения в responses:
- `GET /api/v1/documents` теперь возвращает объект с полями:
  - `documents` - массив документов
  - `total` - общее количество
  - `page` - текущая страница
  - `limit` - размер страницы
  - `totalPages` - общее количество страниц
- `POST /api/v1/documents` возвращает `{document: Document}` (статус 201)
- `GET /api/v1/documents/:id` возвращает `{document: Document}`
- `PATCH /api/v1/documents/:id` возвращает `{document: Document}`

### 3. Пользователи

#### Добавлены endpoints:
- `GET /api/v1/users/:id` - получение конкретного пользователя

#### Изменения в структуре данных:
- Все ID теперь UUID формата
- Поле `fullName` вместо отдельных полей имени
- Удалено поле `notesCount` (это внутренняя статистика)
- Даты в формате ISO 8601 (date-time)

#### Изменения в параметрах:
- `page_size` вместо `limit` в query параметрах
- `is_active` вместо `isActive` в query параметрах

#### Изменения в responses:
- `GET /api/v1/users` возвращает объект с полями:
  - `users` - массив пользователей
  - `total_count` - общее количество
  - `page` - текущая страница
  - `page_size` - размер страницы
- `PATCH /api/v1/users/:id` возвращает `{user: User}`
- `DELETE /api/v1/users/:id` возвращает `{success: true, message: "..."}` (статус 200, не 204)

#### Изменения в UpdateUserRequest:
Теперь поддерживается обновление:
- `email` (nullable)
- `username` (nullable)
- `fullName` (nullable)
- `isActive` (nullable)

### 4. Заявки на регистрацию

#### Изменения в структуре данных:
- Все ID теперь UUID формата
- Добавлено поле `metadata` (объект с произвольными данными)
- Добавлены поля `approved_by` и `approved_at`
- Поле `status` принимает значения: `pending`, `approved`, `rejected`
- Удалено поле `request` (заменено на `metadata`)

#### Изменения в endpoints:
- `POST /api/v1/registration-requests` - публичный endpoint (не требует аутентификации)
- Добавлено поле `password` в CreateRegistrationRequestRequest

#### Изменения в параметрах:
- `page_size` вместо `limit`
- `status` для фильтрации (enum: pending, approved, rejected)

#### Изменения в responses:
- `POST /api/v1/registration-requests` возвращает:
  - `request_id` (UUID)
  - `status` (string)
  - `message` (string)
- `GET /api/v1/registration-requests` возвращает объект с полями:
  - `requests` - массив заявок
  - `total_count` - общее количество
  - `page` - текущая страница
  - `page_size` - размер страницы
- `POST /api/v1/registration-requests/:id/approve` возвращает:
  - `success` (boolean)
  - `message` (string)
  - `user` (объект User, nullable)
- `POST /api/v1/registration-requests/:id/reject` возвращает:
  - `success` (boolean)
  - `message` (string)

### 5. Ошибки

#### Единая структура ErrorResponse:
```json
{
  "error": "validation_error",
  "message": "Invalid request data",
  "details": {
    "email": "invalid email format"
  }
}
```

Поля:
- `error` - код ошибки (string)
- `message` - описание ошибки (string)
- `details` - дополнительные детали (object, optional)

Удалено поле `code` (используется `error` вместо него).

### 6. Удаленные endpoints

- `GET /api/v1/admin/stats/dashboard` - статистика (пока не реализована в Gateway)

## Технические детали

### Cookie-based Authentication
API теперь использует HttpOnly cookies для хранения:
- `refresh_token` - токен для обновления access token
- `token_id` - идентификатор сессии
- `fingerprint` - отпечаток устройства для дополнительной безопасности

### HTTP методы
- `POST` - создание ресурсов
- `GET` - получение ресурсов
- `PATCH` - частичное обновление (все поля optional)
- `DELETE` - удаление ресурсов

### Форматы данных
- Даты: ISO 8601 format (date-time) - `2024-01-15T10:00:00Z`
- UUID: стандартный формат - `550e8400-e29b-41d4-a716-446655440000`
- Все тексты в UTF-8

### Пагинация
Стандартные параметры для пагинации:
- Documents: `page` и `limit` (default: page=1, limit=20)
- Users и Registration Requests: `page` и `page_size` (default: page=1, page_size=10)

## Миграция с предыдущей версии

### Breaking Changes

1. **Аутентификация**:
   - Замените `token` на `access_token` в ответе login
   - Используйте refresh token из cookie для обновления токена
   - Удалите вызовы `/auth/me` - данные приходят при логине

2. **Документы**:
   - Измените `PUT` на `PATCH` для обновления
   - Используйте `authorId` (UUID) вместо `author` (string)
   - Используйте `categoryId` (integer) вместо `category` (string)
   - Добавьте обработку `tags` (массив объектов)
   - Удалите обработку `content` (если была)

3. **Пользователи**:
   - Замените `limit` на `page_size`
   - Замените `isActive` на `is_active` в query
   - Обрабатывайте `fullName` вместо отдельных полей
   - Удалите обработку `notesCount`

4. **Заявки на регистрацию**:
   - Замените `limit` на `page_size`
   - Обрабатывайте `metadata` вместо `request`
   - Добавьте поле `password` при создании заявки

5. **Ошибки**:
   - Используйте `error` вместо `code`
   - Обрабатывайте опциональное поле `details`

## Файлы
- Swagger спецификация: `frontend/apps/admin-panel/docs/api-swagger.yaml`
- Можно импортировать в Swagger UI, Postman, Insomnia для тестирования

## Совместимость
- OpenAPI версия: 3.0.3
- Соответствует реализации Gateway API v1.0.0
