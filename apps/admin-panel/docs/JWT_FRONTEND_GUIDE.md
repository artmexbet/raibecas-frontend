# Frontend JWT Integration Guide

## Обзор изменений

Фронтенд обновлён для работы с новой JWT системой, которая включает:
- **Token Fingerprint** в HttpOnly cookies
- **Access Token** в памяти (не в localStorage)
- **Автоматический refresh** токенов
- **Безопасное хранение** данных

## Структура файлов

### Новые файлы:
```
src/
├── services/
│   ├── tokenManager.ts      ✅ Управление токенами в памяти
│   ├── api.ts               ✅ Обновлён с интерцепторами
│   └── auth.service.ts      ✅ Обновлён для новой JWT системы
├── hooks/
│   └── useAuth.ts           ✅ React hook для авторизации
├── types/
│   └── auth.ts              ✅ Обновлены типы
└── constants/
    └── api.ts               ✅ Обновлены константы
```

## Ключевые изменения

### 1. Token Manager
```typescript
// Токены теперь хранятся в памяти, а не в localStorage
import { tokenManager } from './services/tokenManager';

// Установить токен
tokenManager.setAccessToken(token);

// Получить токен
const token = tokenManager.getAccessToken();

// Очистить токен
tokenManager.clearAccessToken();
```

### 2. Axios Interceptors

#### Request Interceptor
```typescript
// Автоматически добавляет access token к каждому запросу
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Response Interceptor с Auto-Refresh
```typescript
// Автоматически обновляет токен при 401 ошибке
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Если уже идёт refresh - ждём
      if (tokenManager.getIsRefreshing()) {
        return new Promise(resolve => {
          tokenManager.addRefreshSubscriber(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // Обновляем токен
      const { access_token } = await axios.post('/auth/refresh');
      tokenManager.setAccessToken(access_token);
      
      // Повторяем оригинальный запрос
      return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

### 3. Auth Service

#### Login
```typescript
const login = async (email: string, password: string) => {
  const response = await authService.login({ email, password });
  
  // Access token автоматически сохранён в памяти
  // Fingerprint автоматически установлен в HttpOnly cookie
  // Token ID сохранён в localStorage для logout
  
  return response;
};
```

#### Logout
```typescript
const logout = async () => {
  await authService.logout();
  
  // Очищает:
  // - Access token из памяти
  // - Token ID из localStorage
  // - Fingerprint cookie (через сервер)
  // - Данные администратора
};
```

#### Initialize Auth (при загрузке приложения)
```typescript
const initApp = async () => {
  const isAuthenticated = await authService.initializeAuth();
  
  if (isAuthenticated) {
    // Пользователь авторизован, access token обновлён
  } else {
    // Нужна авторизация
  }
};
```

### 4. React Hook

```typescript
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, admin, isLoading, checkAuth } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard admin={admin} />;
}
```

## Использование в компонентах

### Login Component
```typescript
import { useState } from 'react';
import { authService } from '../services/auth.service';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await authService.login({ email, password });
      
      // Редирект на главную страницу
      window.location.href = '/';
    } catch (err) {
      setError('Неверный email или пароль');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Protected Component
```typescript
import { useAuth } from '../hooks/useAuth';

function Dashboard() {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {admin?.username}!</h1>
      <p>Role: {admin?.role}</p>
    </div>
  );
}
```

### Logout Button
```typescript
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Выйти
    </button>
  );
}
```

## API Requests

### Обычные запросы
```typescript
// Access token добавляется автоматически
// Fingerprint cookie отправляется автоматически

// GET запрос
const users = await apiClient.get('/users');

// POST запрос
const newUser = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// PUT запрос
const updated = await apiClient.put(`/users/${id}`, {
  name: 'Jane Doe',
});

// DELETE запрос
await apiClient.delete(`/users/${id}`);
```

### Обработка ошибок
```typescript
try {
  const response = await apiClient.get('/protected-resource');
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Автоматически обработано интерцептором
      // Токен обновлён, запрос повторён
    } else if (error.response?.status === 403) {
      // Нет прав доступа
      console.error('Access denied');
    } else {
      // Другие ошибки
      console.error('Request failed:', error.message);
    }
  }
}
```

## Что НЕ нужно делать

### ❌ НЕ храните токены в localStorage
```typescript
// ❌ ПЛОХО
localStorage.setItem('token', token);

// ✅ ХОРОШО
tokenManager.setAccessToken(token);
```

### ❌ НЕ трогайте fingerprint cookie
```typescript
// ❌ ПЛОХО
document.cookie = 'fp=...';

// ✅ ХОРОШО
// Fingerprint устанавливается сервером автоматически
// HttpOnly cookie не доступен из JavaScript
```

### ❌ НЕ забывайте withCredentials
```typescript
// ❌ ПЛОХО
axios.post('/auth/login', { email, password });

// ✅ ХОРОШО
axios.post('/auth/login', { email, password }, {
  withCredentials: true, // Для fingerprint cookie
});
```

## Безопасность

### 1. Access Token в памяти
- **Защита от XSS**: токен не в localStorage/sessionStorage
- **Потеря при обновлении страницы**: автоматически восстанавливается через refresh

### 2. Fingerprint в HttpOnly Cookie
- **Защита от XSS**: не доступен JavaScript
- **Защита от CSRF**: SameSite=Strict
- **Автоматическая отправка**: браузер отправляет с каждым запросом

### 3. Автоматический Refresh
- **Прозрачность**: пользователь не замечает обновления
- **Очередь запросов**: все 401 запросы ждут обновления токена
- **Один refresh**: только один запрос на refresh одновременно

## Отладка

### Проверка токена в памяти
```typescript
console.log('Access Token:', tokenManager.getAccessToken());
```

### Проверка cookies
```typescript
// В браузере: DevTools -> Application -> Cookies
// Должен быть cookie 'fp' с флагом HttpOnly
```

### Проверка запросов
```typescript
// В браузере: DevTools -> Network
// Каждый запрос должен содержать:
// - Header: Authorization: Bearer <token>
// - Cookie: fp=<fingerprint>
```

### Логирование interceptor
```typescript
// Добавьте в api.ts для отладки
apiClient.interceptors.request.use(config => {
  console.log('Request:', config.url, {
    hasToken: !!config.headers.Authorization,
    withCredentials: config.withCredentials,
  });
  return config;
});
```

## Миграция со старого кода

### Было:
```typescript
// Старый код
localStorage.setItem('token', token);
const token = localStorage.getItem('token');
```

### Стало:
```typescript
// Новый код
tokenManager.setAccessToken(token);
const token = tokenManager.getAccessToken();
```

### Было:
```typescript
// Старый axios
axios.create({ baseURL: API_URL });
```

### Стало:
```typescript
// Новый axios с credentials
axios.create({
  baseURL: API_URL,
  withCredentials: true, // ВАЖНО!
});
```

## Troubleshooting

### "401 Unauthorized" постоянно
- Проверьте что `withCredentials: true` установлен
- Проверьте CORS настройки сервера (AllowCredentials: true)
- Проверьте что fingerprint cookie установлен

### "Network Error" при refresh
- Проверьте что API_BASE_URL правильный
- Проверьте что сервер запущен
- Проверьте CORS настройки

### Токен не обновляется автоматически
- Проверьте что interceptor установлен
- Проверьте что originalRequest._retry работает
- Посмотрите логи в консоли

## Production Checklist

- [ ] HTTPS включен (обязательно для secure cookies)
- [ ] CORS настроен с AllowCredentials: true
- [ ] Fingerprint cookie с flags: HttpOnly, Secure, SameSite=Strict
- [ ] Access Token TTL = 15-30 минут
- [ ] Refresh Token TTL = 7 дней
- [ ] Error boundary для обработки auth ошибок
- [ ] Logging для мониторинга auth событий

## Полезные ссылки

- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Axios Documentation](https://axios-http.com/docs/intro)
