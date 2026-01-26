# API Documentation

## 🎉 Последнее обновление (26 января 2026)

Документация полностью обновлена в соответствии с реальной реализацией Gateway API сервиса.

## 📁 Основные файлы

1. **api-swagger.yaml** (★ Основной файл)
   - Полная спецификация OpenAPI 3.0.3
   - Все endpoints с описаниями и примерами
   - Схемы данных с валидацией
   - Коды ошибок и responses
   - Поддержка cookie-based refresh tokens

## 📚 Дополнительная документация

В папке `/md/` доступны следующие руководства:

- **api-update-summary.md** - Детальное описание всех изменений API
- **api-quick-reference.md** - Быстрый справочник с примерами всех запросов

## 🚀 Использование документации

### Импорт в инструменты

#### Swagger UI (онлайн)
1. Откройте https://editor.swagger.io/
2. File → Import File
3. Выберите `api-swagger.yaml`

#### Postman
1. Откройте Postman
2. Import → File → Upload Files
3. Выберите `api-swagger.yaml`

#### Insomnia
1. Откройте Insomnia
2. Application → Import/Export → Import Data
3. Выберите `api-swagger.yaml`

### Локальный Swagger UI

С помощью Docker:
```bash
docker run -p 8081:8080 -e SWAGGER_JSON=/docs/api-swagger.yaml -v ${PWD}:/docs swaggerapi/swagger-ui
```

Откройте: http://localhost:8081
   - Обработка ошибок
   - Интеграция с React

6. **.gitattributes**
   - Настройки для GitHub

## 📊 Покрытие API

### Аутентификация (3 эндпоинта)
- ✅ POST /auth/login - Вход в систему
- ✅ POST /auth/logout - Выход
- ✅ GET /auth/me - Текущий администратор

### Документы (5 эндпоинтов)
- ✅ GET /documents - Список документов (с пагинацией, фильтрами, поиском)
- ✅ POST /documents - Создать документ
- ✅ GET /documents/{id} - Получить документ
- ✅ PUT /documents/{id} - Обновить документ
- ✅ DELETE /documents/{id} - Удалить документ

### Пользователи (3 эндпоинта)
- ✅ GET /users - Список пользователей (с пагинацией, фильтрами)
- ✅ PATCH /users/{id} - Обновить статус
- ✅ DELETE /users/{id} - Удалить пользователя

### Заявки на регистрацию (3 эндпоинта)
- ✅ GET /registration-requests - Список заявок
- ✅ POST /registration-requests/{id}/approve - Одобрить
- ✅ POST /registration-requests/{id}/reject - Отклонить

### Статистика (1 эндпоинт)
- ✅ GET /admin/stats/dashboard - Статистика Dashboard

**Итого: 15 эндпоинтов**

## 📋 Схемы данных

Все схемы полностью типизированы и документированы:

1. **Admin** - Администратор
2. **LoginCredentials** - Данные для входа
3. **LoginResponse** - Ответ при входе
4. **Document** - Документ (полная модель)
5. **CreateDocumentRequest** - Создание документа
6. **UpdateDocumentRequest** - Обновление документа
7. **User** - Пользователь
8. **UpdateUserRequest** - Обновление пользователя
9. **RegistrationRequest** - Заявка на регистрацию
10. **DashboardStats** - Статистика Dashboard
11. **Error** - Формат ошибки

## 🚀 Как использовать

### Локальный просмотр

```bash
# Запустить Swagger UI
bun run docs:serve

# Откроется http://localhost:8081
```

### Онлайн просмотр

1. Перейти на https://editor.swagger.io/
2. Скопировать содержимое `api-swagger.yaml`
3. Вставить в редактор

### Валидация

```bash
# Проверить корректность спецификации
bun run docs:validate
```

### Генерация клиента

```bash
# Установить генератор
npm install -g @openapitools/openapi-generator-cli

# Сгенерировать TypeScript клиент
openapi-generator-cli generate \
  -i docs/api-swagger.yaml \
  -g typescript-axios \
  -o ./generated-client
```

## 📖 Особенности документации

### Полнота
- Все эндпоинты задокументированы
- Все параметры описаны
- Примеры запросов и ответов
- Коды ошибок и их описания

### Интерактивность
- Swagger UI позволяет тестировать API
- Автоматическая подстановка Bearer токена
- Сохранение авторизации между запросами

### Примеры
- TypeScript примеры для всех операций
- cURL команды для CLI
- Обработка ошибок
- Интеграция с React

### Безопасность
- JWT Bearer Authentication
- Описание ролей и прав
- Коды ошибок авторизации

## 🔗 Ссылки на файлы

- [Swagger YAML](./api-swagger.yaml)
- [Swagger JSON](./api-swagger.json)
- [Документация](./API_DOCUMENTATION.md)
- [Примеры](./API_EXAMPLES.md)
- [Swagger UI](./index.html)

## ✅ Готово к использованию

Документация полностью готова для:
- Backend разработчиков (реализация API)
- Frontend разработчиков (интеграция)
- QA инженеров (тестирование)
- Технических писателей (дополнение)
- DevOps (настройка окружения)

Документация соответствует стандарту OpenAPI 3.0.3 и может быть использована для автоматической генерации клиентов, серверных заглушек и тестов.
