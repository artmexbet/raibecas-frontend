# API Documentation

Документация API для административной панели Raibecas.

## Форматы документации

- **YAML**: `api-swagger.yaml` - основная документация в формате OpenAPI 3.0.3
- **JSON**: Можно сконвертировать YAML в JSON при необходимости:

```bash
# Используя swagger-cli
npx @apidevtools/swagger-cli bundle api-swagger.yaml -o api-swagger.json -t json

# Или онлайн конвертер
# https://www.convertjson.com/yaml-to-json.htm
```

## Просмотр документации

### Онлайн просмотр

1. **Swagger Editor** (онлайн):
   - Перейдите на https://editor.swagger.io/
   - Скопируйте содержимое `api-swagger.yaml`
   - Вставьте в редактор

2. **Swagger UI** (локально):
   ```bash
   # Установите swagger-ui-watcher
   npm install -g swagger-ui-watcher
   
   # Запустите просмотр
   swagger-ui-watcher api-swagger.yaml
   ```

3. **VS Code расширение**:
   - Установите расширение "OpenAPI (Swagger) Editor"
   - Откройте файл `api-swagger.yaml`
   - Используйте Preview для просмотра

### Локальный Swagger UI через Docker

```bash
docker run -p 8081:8080 -e SWAGGER_JSON=/api-swagger.yaml -v ${PWD}:/usr/share/nginx/html swaggerapi/swagger-ui
```

Затем откройте http://localhost:8081

## Структура API

### Authentication (`/auth`)
- `POST /auth/login` - Вход в систему
- `POST /auth/logout` - Выход из системы
- `GET /auth/me` - Получить текущего администратора

### Documents (`/documents`)
- `GET /documents` - Список документов (с пагинацией и фильтрами)
- `POST /documents` - Создать документ
- `GET /documents/{id}` - Получить документ
- `PUT /documents/{id}` - Обновить документ
- `DELETE /documents/{id}` - Удалить документ

### Users (`/users`)
- `GET /users` - Список пользователей (с пагинацией и фильтрами)
- `PATCH /users/{id}` - Обновить статус пользователя
- `DELETE /users/{id}` - Удалить пользователя

### Registration Requests (`/registration-requests`)
- `GET /registration-requests` - Список заявок
- `POST /registration-requests/{id}/approve` - Одобрить заявку
- `POST /registration-requests/{id}/reject` - Отклонить заявку

### Statistics (`/admin/stats`)
- `GET /admin/stats/dashboard` - Статистика для Dashboard

## Аутентификация

API использует JWT Bearer токен аутентификацию.

### Получение токена

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@raibecas.kz",
    "password": "your-password"
  }'
```

### Использование токена

Добавьте токен в заголовок Authorization для всех запросов:

```bash
curl -X GET http://localhost:8080/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Примеры запросов

### Создание документа

```bash
curl -X POST http://localhost:8080/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Бытие и время",
    "description": "Фундаментальная онтология",
    "content": "# Введение\n\nОсновные положения...",
    "author": "Мартин Хайдеггер",
    "category": "Онтология",
    "publicationDate": "1927-01-01",
    "tags": ["философия", "хайдеггер", "онтология"]
  }'
```

### Получение списка пользователей с фильтрацией

```bash
curl -X GET "http://localhost:8080/api/users?page=1&limit=20&isActive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Одобрение заявки на регистрацию

```bash
curl -X POST http://localhost:8080/api/registration-requests/req-001/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Получение статистики

```bash
curl -X GET http://localhost:8080/api/admin/stats/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Ресурс создан |
| 204 | Успешно, без содержимого |
| 400 | Ошибка валидации |
| 401 | Не авторизован |
| 403 | Недостаточно прав |
| 404 | Ресурс не найден |
| 422 | Ошибка обработки данных |
| 500 | Внутренняя ошибка сервера |

## Формат ошибок

Все ошибки возвращаются в стандартном формате:

```json
{
  "message": "Описание ошибки",
  "code": "ERROR_CODE",
  "details": {
    "field": "Дополнительная информация"
  }
}
```

## Генерация клиентского кода

### TypeScript/JavaScript

```bash
npm install -g @openapitools/openapi-generator-cli

openapi-generator-cli generate \
  -i api-swagger.yaml \
  -g typescript-axios \
  -o ./generated-client
```

### Другие языки

OpenAPI Generator поддерживает генерацию клиентов для множества языков:
- Python
- Java
- C#
- Go
- Ruby
- PHP
- и многие другие

## Тестирование API

### Postman

1. Импортируйте `api-swagger.yaml` в Postman
2. Postman автоматически создаст коллекцию со всеми эндпоинтами
3. Настройте переменную окружения `baseUrl` и `token`

### Insomnia

1. Откройте Insomnia
2. Создайте новый Request Collection
3. Импортируйте OpenAPI спецификацию
4. Настройте базовый URL и токен аутентификации

## Обновление документации

При добавлении новых эндпоинтов или изменении существующих:

1. Обновите `api-swagger.yaml`
2. Проверьте валидность через Swagger Editor
3. Обновите примеры в этом README
4. Обновите клиентские SDK (если используются)

## Валидация спецификации

### Онлайн

- https://apitools.dev/swagger-parser/online/
- https://editor.swagger.io/

### Локально

```bash
npm install -g swagger-cli

swagger-cli validate api-swagger.yaml
```

## Полезные ссылки

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Generator](https://openapi-generator.tech/)
