# JWT Authentication - Frontend Quick Start

## ✅ Что было сделано

Фронтенд обновлён для работы с современной JWT системой:
- ✅ **TokenManager** - управление токенами в памяти
- ✅ **Axios Interceptors** - автоматический refresh токенов
- ✅ **Auth Service** - полностью переписан
- ✅ **useAuth Hook** - для React компонентов
- ✅ **Types** - обновлены для новой системы

## 📁 Изменённые файлы

```
src/
├── services/
│   ├── tokenManager.ts      ✅ НОВЫЙ - управление токенами
│   ├── api.ts               ✅ ОБНОВЛЁН - interceptors
│   └── auth.service.ts      ✅ ОБНОВЛЁН - новая JWT система
├── hooks/
│   └── useAuth.ts           ✅ НОВЫЙ - React hook
├── types/
│   └── auth.ts              ✅ ОБНОВЛЁН - новые типы
└── constants/
    └── api.ts               ✅ ОБНОВЛЁН - новые endpoints
```

## 🚀 Как использовать

### 1. Login
```typescript
import { authService } from './services/auth.service';

const handleLogin = async () => {
  try {
    await authService.login({
      email: 'admin@example.com',
      password: 'password123',
    });
    
    // Access token в памяти ✅
    // Fingerprint в HttpOnly cookie ✅
    // Token ID в localStorage ✅
    
    window.location.href = '/';
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 2. API Requests
```typescript
import apiClient from './services/api';

// Токен добавляется автоматически!
const users = await apiClient.get('/users');

// При 401 токен обновляется автоматически!
const data = await apiClient.post('/protected', { ... });
```

### 3. React Hook
```typescript
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, admin, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <LoginPage />;
  
  return <Dashboard admin={admin} />;
}
```

### 4. Logout
```typescript
import { authService } from './services/auth.service';

const handleLogout = async () => {
  await authService.logout();
  window.location.href = '/login';
};
```

## 🔐 Ключевые особенности

### Access Token в ПАМЯТИ (не в localStorage!)
```typescript
// ✅ ПРАВИЛЬНО
import { tokenManager } from './services/tokenManager';
tokenManager.setAccessToken(token);

// ❌ НЕПРАВИЛЬНО
localStorage.setItem('token', token);
```

### Fingerprint в HttpOnly Cookie
```typescript
// Устанавливается сервером автоматически
// НЕ ТРОГАЙТЕ его в JavaScript!
// Браузер отправляет автоматически с каждым запросом
```

### Автоматический Refresh
```typescript
// При 401 ошибке:
// 1. Автоматически вызывается /auth/refresh
// 2. Получается новый access token
// 3. Токен сохраняется в памяти
// 4. Оригинальный запрос повторяется
// 
// Вы ничего не делаете - всё работает автоматически! ✨
```

## ⚙️ Конфигурация

### API Base URL
```typescript
// src/constants/api.ts
export const API_BASE_URL = 'http://localhost:8080/api';
```

### CORS (на backend)
```go
// Backend должен поддерживать credentials
cors.New(cors.Options{
    AllowedOrigins:   []string{"http://localhost:3000"},
    AllowCredentials: true, // ВАЖНО!
    AllowedHeaders:   []string{"Authorization", "Content-Type"},
})
```

## 📝 Миграция старого кода

### Обновите импорты:
```typescript
// Было
import { authService } from './services/auth.service';
const token = authService.getToken();

// Стало
import { authService } from './services/auth.service';
const token = authService.getAccessToken(); // Теперь из памяти
```

### Обновите Login компонент:
```typescript
// Было
const { token, admin } = await authService.login(credentials);
localStorage.setItem('token', token);

// Стало
const { admin } = await authService.login(credentials);
// Токен сохраняется автоматически в памяти
```

### Обновите Auth проверки:
```typescript
// Было
useEffect(() => {
  if (!authService.isAuthenticated()) {
    navigate('/login');
  }
}, []);

// Стало
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) return <Loading />;
if (!isAuthenticated) return <Redirect to="/login" />;
```

## 🐛 Troubleshooting

### Постоянные 401 ошибки?
1. Проверьте `withCredentials: true` в axios config
2. Проверьте CORS на backend (`AllowCredentials: true`)
3. Проверьте что fingerprint cookie установлен (DevTools → Application → Cookies)

### Токен не обновляется?
1. Проверьте endpoint `/auth/refresh` на backend
2. Проверьте что refresh token cookie отправляется
3. Посмотрите Network tab в DevTools

### Logout не работает?
1. Проверьте что token_id сохранён в localStorage
2. Проверьте endpoint `/auth/logout` на backend

## 📚 Полная документация

См. [JWT_FRONTEND_GUIDE.md](./JWT_FRONTEND_GUIDE.md) для полной документации

## ✨ Что получаем

- 🛡️ **Защита от XSS** - токены не в localStorage
- 🛡️ **Защита от CSRF** - fingerprint проверка
- 🔄 **Автоматический refresh** - прозрачно для пользователя
- 🚀 **Лучший UX** - пользователь не замечает обновлений токена
- 📱 **Multi-device** - каждое устройство со своим токеном

## 🎯 Next Steps

1. Обновите компоненты для использования `useAuth` hook
2. Обновите API запросы (убедитесь что используют `apiClient`)
3. Протестируйте login/logout
4. Протестируйте автоматический refresh
5. Deploy и радуйтесь! 🎉
