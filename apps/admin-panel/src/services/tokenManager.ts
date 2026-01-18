// Token Manager - управление токенами в памяти
class TokenManager {
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  /**
   * Устанавливает access token в память
   */
  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  /**
   * Получает access token из памяти
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Очищает access token
   */
  clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * Проверяет, идёт ли сейчас обновление токена
   */
  getIsRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Устанавливает флаг обновления токена
   */
  setIsRefreshing(value: boolean): void {
    this.isRefreshing = value;
  }

  /**
   * Добавляет подписчика на обновление токена
   */
  addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Уведомляет всех подписчиков о новом токене
   */
  notifyRefreshSubscribers(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Очищает подписчиков
   */
  clearRefreshSubscribers(): void {
    this.refreshSubscribers = [];
  }
}

export const tokenManager = new TokenManager();
