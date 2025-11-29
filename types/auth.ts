/**
 * Authentication Types
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  organization?: Organization;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'startup' | 'growth' | 'enterprise';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  organization_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
