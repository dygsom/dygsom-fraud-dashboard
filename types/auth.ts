/**
 * Authentication Types
 *
 * Dashboard uses API Key authentication (no email/password or signup).
 * These types define the authentication context for tenant access.
 *
 * @module types/auth
 */

import type { Tenant } from './dashboard';

/**
 * Authentication context type
 * Used by AuthContext to manage tenant session
 */
export interface AuthContextType {
  tenant: Tenant | null;
  apiKey: string | null;
  isLoading: boolean;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
}
