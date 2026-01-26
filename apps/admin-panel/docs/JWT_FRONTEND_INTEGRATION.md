# Frontend JWT Integration Guide

## Краткое описание изменений

Gateway теперь реализует безопасную архитектуру JWT с использованием HttpOnly cookies для хранения чувствительных данных.

## Что изменилось

### ❌ Старый подход (небезопасный)
```typescript
// Клиент получал все токены
const response = await api.post('/auth/login', credentials);
localStorage.setItem('access_token', response.data.access_token);
localStorage.setItem('refresh_token', response.data.refresh_token);
localStorage.setItem('token_id', response.data.token_id);
```

### ✅ Новый подход (безопасный)
```typescript
// Клиент получает только access_token
const response = await api.post('/auth/login', credentials, {
  withCredentials: true // ВАЖНО!
});

// В памяти (НЕ в localStorage!)
tokenManager.setAccessToken(response.data.access_token);

// refresh_token, token_id, fingerprint - автоматически в HttpOnly cookies
```

## Структура ответов API

### Login Response
```typescript
interface LoginResponse {
  access_token: string;   // Для Authorization header
  expires_in: number;     // Время жизни в секундах (обычно 900 = 15 минут)
  token_type: string;     // "Bearer"
  user?: {                // Опционально
    id: string;
    email?: string;
    role: string;
  };
}
```

**Важно**: 
- `refresh_token`, `token_id`, `fingerprint` НЕ возвращаются в JSON
- Они автоматически устанавливаются в HttpOnly cookies
- JavaScript не имеет доступа к этим cookies

### Refresh Response
```typescript
interface RefreshResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  user?: {
    id: string;
    email?: string;
    role: string;
  };
}
```

Аналогично login, новые токены в cookies устанавливаются автоматически.

## Настройка Axios

### API Client конфигурация

```typescript
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true, // ОБЯЗАТЕЛЬНО для cookies
});
```

### Request Interceptor

```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);
```

### Response Interceptor (автообновление)

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh использует cookies автоматически
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { device_id: getDeviceId() },
          { withCredentials: true } // ВАЖНО!
        );

        const { access_token } = response.data;
        tokenManager.setAccessToken(access_token);

        // Повторяем оригинальный запрос
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Logout пользователя
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## Token Manager (в памяти)

```typescript
class TokenManager {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  // Для очереди запросов во время refresh
  setIsRefreshing(value: boolean) {
    this.isRefreshing = value;
  }

  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  notifyRefreshSubscribers(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  clearRefreshSubscribers() {
    this.refreshSubscribers = [];
  }
}

export const tokenManager = new TokenManager();
```

## Auth Service примеры

### Login

```typescript
async login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    '/auth/login',
    {
      ...credentials,
      device_id: getDeviceId(),
    },
    {
      withCredentials: true, // ОБЯЗАТЕЛЬНО
    }
  );

  const { access_token, user } = response.data;

  // Сохраняем только access_token в память
  tokenManager.setAccessToken(access_token);

  // Опционально: сохраняем публичные данные пользователя
  if (user) {
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  return response.data;
}
```

### Logout

```typescript
async logout(): Promise<void> {
  try {
    const accessToken = tokenManager.getAccessToken();

    await apiClient.post(
      '/auth/logout',
      { token: accessToken },
      { withCredentials: true } // ОБЯЗАТЕЛЬНО
    );
  } finally {
    // Очищаем локальные данные
    tokenManager.clearAccessToken();
    localStorage.removeItem('user_data');
  }
}
```

### Refresh (обычно вызывается автоматически)

```typescript
async refreshToken(): Promise<void> {
  const response = await apiClient.post<RefreshResponse>(
    '/auth/refresh',
    { device_id: getDeviceId() },
    { withCredentials: true }
  );

  tokenManager.setAccessToken(response.data.access_token);
}
```

### Initialize Auth (при загрузке приложения)

```typescript
async initializeAuth(): Promise<boolean> {
  try {
    const storedUser = localStorage.getItem('user_data');
    if (!storedUser) {
      return false;
    }

    // Пытаемся получить новый access token
    await this.refreshToken();
    return true;
  } catch (error) {
    // Refresh не удался - требуется новый логин
    this.clearAuthData();
    return false;
  }
}
```

## Device ID

```typescript
function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}
```

## Что НЕ нужно делать

### ❌ НЕ хранить access_token в localStorage
```typescript
// ❌ УЯЗВИМО к XSS атакам
localStorage.setItem('access_token', token);
```

### ❌ НЕ пытаться читать HttpOnly cookies
```typescript
// ❌ НЕ РАБОТАЕТ (и это хорошо!)
const refreshToken = document.cookie.match(/refresh_token=([^;]+)/);
```

### ❌ НЕ забывать withCredentials
```typescript
// ❌ Cookies не будут отправлены
await api.post('/auth/login', credentials);

// ✅ Правильно
await api.post('/auth/login', credentials, { withCredentials: true });
```

### ❌ НЕ пытаться вручную управлять refresh
```typescript
// ❌ НЕ НАДО - interceptor делает это автоматически
if (isTokenExpired()) {
  await refreshToken();
}
```

## Storage Best Practices

### ✅ В памяти (React State/Variable)
- Access token

### ✅ HttpOnly Cookies (автоматически)
- Refresh token
- Token ID
- Fingerprint

### ✅ localStorage (только публичные данные)
- User ID
- User role
- Username
- Device ID
- Настройки UI
- Предпочтения пользователя

### ❌ НИКОГДА не храните
- Пароли
- Refresh tokens
- Любые токены в localStorage
- Приватные ключи
- Чувствительные персональные данные

## Проверка работы

### В DevTools

1. **Network tab**
   - Проверьте, что запросы содержат `Authorization: Bearer ...`
   - Проверьте, что присутствует `Cookie: refresh_token=...`

2. **Application → Cookies**
   - `refresh_token` (HttpOnly: ✓, Secure: зависит от окружения)
   - `token_id` (HttpOnly: ✓)
   - `fingerprint` (HttpOnly: ✓)

3. **Console**
   ```javascript
   // Должно вернуть пустую строку (HttpOnly защита работает)
   document.cookie.match(/refresh_token/)
   ```

## Типичные ошибки и решения

### Ошибка: 401 Unauthorized при каждом запросе

**Причина**: Access token не устанавливается в заголовок

**Решение**: Проверьте request interceptor

### Ошибка: Автообновление не работает

**Причина**: `withCredentials: true` не установлен

**Решение**: 
```typescript
axios.post('/auth/refresh', data, { withCredentials: true })
```

### Ошибка: CORS blocked

**Причина**: Несовпадение origin и allowedOrigins

**Решение**: 
- Убедитесь, что Gateway настроен на ваш frontend URL
- Проверьте `AllowCredentials: true` в CORS

### Ошибка: Cookies не сохраняются

**Причина**: 
- Несоответствие Secure flag и протокола (HTTP/HTTPS)
- SameSite=Strict блокирует cookies

**Решение**: 
- Development: Убедитесь, что `ENVIRONMENT != production`
- Production: Используйте HTTPS

## Дополнительные ресурсы

- [Gateway Security Architecture](./SECURITY_ARCHITECTURE.md)
- [Local Testing Guide](./LOCAL_TESTING.md)
- [JWT Best Practices](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-token-best-practices)
