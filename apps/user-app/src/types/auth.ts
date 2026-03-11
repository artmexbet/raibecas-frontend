export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  device_id?: string;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  reason?: string;       // Причина интереса к библиотеке
  occupation?: string;   // Образование / область деятельности
}

// TODO: уточнить формат ответа на бэкенде
export interface RegisterResponse {
  message: string;
  status: 'pending' | 'approved';
}

export interface RefreshResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}


