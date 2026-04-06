export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  emailVerified: boolean;
  phoneVerified?: boolean;
  organizationId?: string;
  interestedEventCategories?: string[];
  hostingEventTypes?: string[];
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  USER: 'user',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
