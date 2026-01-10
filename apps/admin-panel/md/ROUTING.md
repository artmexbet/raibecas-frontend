# Роутинг в административной панели

## Обзор

В проекте используется **TanStack Router** для организации маршрутизации с поддержкой защищенных роутов и системы прав доступа.

## Структура роутинга

### Файлы

- `src/router/index.tsx` - конфигурация маршрутов
- `src/components/ProtectedRoute.tsx` - компонент для защиты маршрутов
- `src/types/permissions.ts` - система прав доступа
- `src/layouts/AdminLayout.tsx` - основной layout с навигацией

## Система прав доступа

### Роли

```typescript
enum AdminRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
```

### Права (Permissions)

- `view_documents` - просмотр документов
- `create_documents` - создание документов
- `edit_documents` - редактирование документов
- `delete_documents` - удаление документов
- `view_users` - просмотр пользователей
- `manage_users` - управление пользователями
- `view_registration_requests` - просмотр заявок на регистрацию
- `manage_registration_requests` - управление заявками
- `view_statistics` - просмотр статистики
- `manage_settings` - управление настройками (только super_admin)

### Карта прав по ролям

**ADMIN:**
- Доступ ко всем функциям, кроме управления пользователями и настройками

**SUPER_ADMIN:**
- Полный доступ ко всем функциям

## Использование Protected Routes

### Базовая защита (только аутентификация)

```tsx
<ProtectedRoute requireAuth>
  <YourComponent />
</ProtectedRoute>
```

### Защита с проверкой прав

```tsx
<ProtectedRoute 
  requireAuth 
  permissions={['view_documents', 'edit_documents']}
>
  <DocumentEditor />
</ProtectedRoute>
```

При указании массива прав, пользователь должен иметь **хотя бы одно** из них.

### Кастомный редирект

```tsx
<ProtectedRoute 
  requireAuth 
  redirectTo="/custom-login"
>
  <YourComponent />
</ProtectedRoute>
```

## Добавление нового маршрута

### 1. Создать компонент страницы

```tsx
// src/pages/NewPage.tsx
export function NewPage() {
  return <div>New Page Content</div>;
}
```

### 2. Добавить маршрут в роутер

```tsx
// src/router/index.tsx
import { NewPage } from '../pages/NewPage';

const newPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/new-page',
  component: () => (
    <ProtectedRoute 
      requireAuth 
      permissions={['some_permission']}
    >
      <AdminLayout>
        <NewPage />
      </AdminLayout>
    </ProtectedRoute>
  ),
});

// Добавить в routeTree
const routeTree = rootRoute.addChildren([
  // ...existing routes
  newPageRoute,
]);
```

### 3. Добавить пункт в меню (опционально)

```tsx
// src/layouts/AdminLayout.tsx
const menuItems: MenuProps['items'] = [
  // ...existing items
  {
    key: 'new-page',
    icon: <SomeIcon />,
    label: 'Новая страница',
  },
];

const handleMenuClick = (key: string) => {
  const routes: Record<string, string> = {
    // ...existing routes
    'new-page': '/new-page',
  };
  // ...
};
```

## Навигация в коде

### Использование хука useNavigate

```tsx
import { useNavigate } from '@tanstack/react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/documents' });
  };

  return <button onClick={handleClick}>Go to Documents</button>;
}
```

### Получение текущего роута

```tsx
import { useRouterState } from '@tanstack/react-router';

function MyComponent() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return <div>Current path: {currentPath}</div>;
}
```

## Текущие маршруты

| Путь | Компонент | Права доступа | Описание |
|------|-----------|---------------|----------|
| `/login` | LoginPage | Публичный | Страница входа |
| `/` | DashboardPage | Требует аутентификации | Главная панель |
| `/documents` | (В разработке) | `view_documents` | Список документов |
| `/registration-requests` | (В разработке) | `view_registration_requests` | Заявки на регистрацию |
| `/users` | (В разработке) | `view_users` | Список пользователей |
| `/settings` | (В разработке) | `manage_settings` | Настройки (только super_admin) |

## HOC для защиты компонентов

Если нужно защитить компонент напрямую:

```tsx
import { withProtectedRoute } from '../components/ProtectedRoute';

const MyComponent = () => <div>Protected Content</div>;

export const ProtectedMyComponent = withProtectedRoute(MyComponent, {
  requireAuth: true,
  permissions: ['view_documents'],
});
```

## Обработка ошибок доступа

При отсутствии прав доступа показывается страница 403 с кнопкой возврата на главную.

## Best Practices

1. **Всегда оборачивайте страницы в AdminLayout** для единообразного UI
2. **Указывайте минимально необходимые права** для каждого маршрута
3. **Используйте Navigate** из TanStack Router, а не window.location
4. **Проверяйте права на backend** - клиентская проверка это только UX
5. **Добавляйте новые права в permissions.ts** перед использованием

## Debugging

Для отладки текущего состояния роутера:

```tsx
import { useRouterState } from '@tanstack/react-router';

const routerState = useRouterState();
console.log('Current route:', routerState.location);
```

Для проверки прав текущего пользователя:

```tsx
import { authService } from '../services/auth.service';
import { hasPermission } from '../types/permissions';

const admin = authService.getStoredAdmin();
if (admin) {
  console.log('Has view_documents?', hasPermission(admin.role, 'view_documents'));
}
```

