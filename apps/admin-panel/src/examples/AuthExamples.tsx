/**
 * Пример использования новой JWT системы аутентификации
 *
 * Этот файл демонстрирует все основные сценарии работы с авторизацией
 */

import React, { useState } from 'react';
import { authService } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/api';

/**
 * 1. Login Component - Страница входа
 */
export function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Вызываем login - токены сохраняются автоматически
      const response = await authService.login({ email, password });

      console.log('Login successful:', {
        userId: response.user_id,
        admin: response.admin,
        // access_token сохранён в памяти
        // fingerprint в HttpOnly cookie
        // token_id в localStorage
      });

      // Редирект на главную
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Вход в систему</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Пароль:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

/**
 * 2. Protected Component - Защищённая страница
 */
export function DashboardExample() {
  const { isAuthenticated, admin, isLoading, checkAuth } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    // Редирект на login
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="dashboard">
      <h1>Панель управления</h1>
      <div className="user-info">
        <p>Привет, {admin?.username}!</p>
        <p>Email: {admin?.email}</p>
        <p>Роль: {admin?.role}</p>
      </div>
      <button onClick={checkAuth}>
        Проверить авторизацию
      </button>
    </div>
  );
}

/**
 * 3. API Request Example - Примеры API запросов
 */
export function APIRequestsExample() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // GET запрос - токен добавляется автоматически
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (err: any) {
      // При 401 токен автоматически обновится и запрос повторится
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // POST запрос
  const createUser = async (userData: any) => {
    try {
      const response = await apiClient.post('/users', userData);
      console.log('User created:', response.data);
      await fetchUsers(); // Обновляем список
    } catch (err: any) {
      console.error('Failed to create user:', err.message);
    }
  };

  // PUT запрос
  const updateUser = async (userId: string, userData: any) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, userData);
      console.log('User updated:', response.data);
      await fetchUsers(); // Обновляем список
    } catch (err: any) {
      console.error('Failed to update user:', err.message);
    }
  };

  // DELETE запрос
  const deleteUser = async (userId: string) => {
    try {
      await apiClient.delete(`/users/${userId}`);
      console.log('User deleted');
      await fetchUsers(); // Обновляем список
    } catch (err: any) {
      console.error('Failed to delete user:', err.message);
    }
  };

  return (
    <div className="api-example">
      <h2>API Requests Example</h2>
      <button onClick={fetchUsers} disabled={loading}>
        {loading ? 'Загрузка...' : 'Загрузить пользователей'}
      </button>
      {error && <div className="error">{error}</div>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.username} - {user.email}
            <button onClick={() => updateUser(user.id, { username: 'Updated' })}>
              Обновить
            </button>
            <button onClick={() => deleteUser(user.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 4. Logout Component - Выход из системы
 */
export function LogoutExample() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      // Очищает:
      // - Access token из памяти
      // - Token ID из localStorage
      // - Admin data из localStorage
      // - Fingerprint cookie (на сервере)

      console.log('Logout successful');
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Logout failed:', err.message);
      // Даже при ошибке очищаем локальные данные
      authService.clearAuthData();
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Выход...' : 'Выйти'}
    </button>
  );
}

/**
 * 5. App Initialization - Инициализация приложения
 */
export function AppInitializationExample() {
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    // При загрузке приложения пытаемся восстановить сессию
    const initAuth = async () => {
      try {
        const isAuth = await authService.initializeAuth();

        if (isAuth) {
          console.log('Session restored');
          // Пользователь авторизован, можно продолжать
        } else {
          console.log('No active session');
          // Нужна авторизация
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, []);

  if (!initialized) {
    return <div>Инициализация...</div>;
  }

  return <div>App ready!</div>;
}

/**
 * 6. Error Handling - Обработка ошибок
 */
export function ErrorHandlingExample() {
  const [error, setError] = useState<string | null>(null);

  const makeRequest = async () => {
    try {
      const response = await apiClient.get('/protected-endpoint');
      console.log('Success:', response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Автоматически обработано interceptor'ом
        // Токен обновлён, запрос повторён
        console.log('Token was refreshed automatically');
      } else if (err.response?.status === 403) {
        setError('У вас нет прав для этого действия');
      } else if (err.response?.status === 404) {
        setError('Ресурс не найден');
      } else {
        setError('Произошла ошибка: ' + err.message);
      }
    }
  };

  return (
    <div>
      <button onClick={makeRequest}>Сделать запрос</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

/**
 * 7. Complete App Example - Полный пример приложения
 */
export function CompleteAppExample() {
  const { isAuthenticated, admin, isLoading } = useAuth();

  // Пока проверяем авторизацию
  if (isLoading) {
    return (
      <div className="app-loading">
        <h1>Загрузка...</h1>
      </div>
    );
  }

  // Если не авторизован - показываем форму входа
  if (!isAuthenticated) {
    return <LoginExample />;
  }

  // Если авторизован - показываем приложение
  return (
    <div className="app">
      <header>
        <h1>Admin Panel</h1>
        <div className="user-menu">
          <span>{admin?.username}</span>
          <LogoutExample />
        </div>
      </header>
      <main>
        <DashboardExample />
        <APIRequestsExample />
      </main>
    </div>
  );
}

/**
 * 8. Custom Hook Example - Пользовательский хук
 */
export function useApiData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(endpoint);
      setData(response.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
}

// Использование custom hook
export function DataDisplayExample() {
  const { data: users, loading, error, refetch } = useApiData<any[]>('/users');

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Обновить</button>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
}
