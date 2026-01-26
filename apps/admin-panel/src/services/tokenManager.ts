const STORAGE_KEY = 'access_token';

class TokenManager {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private persistToStorage = true; // Сохранять ли токены в localStorage

  constructor() {
    // Восстанавливаем токен из localStorage при инициализации
    if (this.persistToStorage) {
      this.accessToken = localStorage.getItem(STORAGE_KEY);
    }
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;

    // Сохраняем в localStorage для persist между перезагрузками
    if (this.persistToStorage) {
      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  clearAccessToken(): void {
    this.setAccessToken(null);
  }

  // Методы для управления очередью запросов при refresh
  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  setIsRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }

  addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  notifyRefreshSubscribers(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  clearRefreshSubscribers(): void {
    this.refreshSubscribers = [];
  }

  // Опционально: возможность отключить persist для повышенной безопасности
  setPersistToStorage(enabled: boolean): void {
    this.persistToStorage = enabled;

    if (!enabled) {
      localStorage.removeItem(STORAGE_KEY);
    } else if (this.accessToken) {
      localStorage.setItem(STORAGE_KEY, this.accessToken);
    }
  }
}

export const tokenManager = new TokenManager();
