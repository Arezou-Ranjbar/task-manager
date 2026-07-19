export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
