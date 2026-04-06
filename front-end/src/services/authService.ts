import api from './api';

// ========== DTOs (Data Transfer Objects) ==========

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  roles?: ('attendee' | 'organizer' | 'admin')[];
  organizationId?: string;
  interestedEventCategories?: string[];
  hostingEventTypes?: string[];
}

export interface LoginDto {
  email?: string;
  phone?: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface SendVerificationCodeDto {
  email?: string;
  phone?: string;
  type: 'email' | 'phone';
  purpose: 'login' | 'registration' | 'email_verification' | 'phone_verification' | 'password_reset';
}

export interface VerifyCodeDto {
  email?: string;
  phone?: string;
  type: 'email' | 'phone';
  code: string;
}

export interface LoginWithCodeDto {
  email?: string;
  phone?: string;
  type: 'email' | 'phone';
  code: string;
}

// ========== Response Types ==========

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
  bio?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface MessageResponse {
  message: string;
  expiresIn?: string;
}

export interface VerificationResponse {
  message: string;
  verified: boolean;
  user?: User;
}

class AuthService {
  // ========== Registration & Login ==========

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      this.setAuthData(response.data.token, response.data.user);
    }
    return response.data;
  }

  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.token) {
      this.setAuthData(response.data.token, response.data.user);
    }
    return response.data;
  }

  async loginWithCode(data: LoginWithCodeDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login-with-code', data);
    if (response.data.token) {
      this.setAuthData(response.data.token, response.data.user);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    this.clearAuthData();
  }

  // ========== Email Verification ==========

  async verifyEmail(data: VerifyEmailDto): Promise<VerificationResponse> {
    const response = await api.post<VerificationResponse>('/auth/verify-email', data);
    // Update user in localStorage if verification successful
    if (response.data.user) {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  }

  async resendVerificationEmail(email: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/resend-verification', { email });
    return response.data;
  }

  // ========== Password Reset ==========

  async forgotPassword(data: ForgotPasswordDto): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordDto): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/reset-password', data);
    return response.data;
  }

  // ========== Verification Codes ==========

  async sendVerificationCode(data: SendVerificationCodeDto): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/send-verification-code', data);
    return response.data;
  }

  async verifyCode(data: VerifyCodeDto): Promise<VerificationResponse> {
    const response = await api.post<VerificationResponse>('/auth/verify-code', data);
    return response.data;
  }

  // ========== Helper Methods ==========

  private setAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    
    // Sanitize user object before storing to prevent quota exceeded errors
    const sanitizedUser = this.sanitizeUserForStorage(user);
    
    try {
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('❌ localStorage quota exceeded. Clearing old data and retrying...');
        // Clear localStorage and try again with minimal data
        localStorage.clear();
        localStorage.setItem('token', token);
        // Store only essential user data
        const minimalUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: user.roles,
          emailVerified: user.emailVerified,
        };
        localStorage.setItem('user', JSON.stringify(minimalUser));
      } else {
        throw error;
      }
    }
  }
  
  private sanitizeUserForStorage(user: User): User {
    // Remove any relations or large objects that might be included
    const sanitized: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      organizationId: user.organizationId,
      interestedEventCategories: user.interestedEventCategories,
      hostingEventTypes: user.hostingEventTypes,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      metadata: user.metadata,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    // Remove any undefined values to reduce size
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
    });
    
    return sanitized;
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  isEmailVerified(): boolean {
    const user = this.getCurrentUser();
    return user?.emailVerified || false;
  }

  isPhoneVerified(): boolean {
    const user = this.getCurrentUser();
    return user?.phoneVerified || false;
  }

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  }

  async getCurrentUserFromServer(): Promise<User> {
    console.log('🔍 [AuthService] Fetching /users/me from backend...');
    const response = await api.get<User>('/users/me');
    console.log('✅ [AuthService] Received user from backend:', response.data);
    console.log('📧 [AuthService] User email:', response.data.email);
    console.log('👤 [AuthService] User name:', response.data.name);
    console.log('🎭 [AuthService] User roles:', response.data.roles);
    // Sync localStorage with fresh server data
    const sanitizedUser = this.sanitizeUserForStorage(response.data);
    localStorage.setItem('user', JSON.stringify(sanitizedUser));
    console.log('💾 [AuthService] Updated localStorage with fresh user data');
    return response.data;
  }

  // ========== User Profile Updates ==========

  async updateProfile(data: { name?: string; phone?: string; bio?: string; avatarUrl?: string }): Promise<User> {
    const response = await api.patch<User>('/users/me/profile', data);
    // Update local storage
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      const sanitizedUser = this.sanitizeUserForStorage(updatedUser);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
    }
    return response.data;
  }

  async updateEmail(data: { newEmail: string; password: string }): Promise<User> {
    const response = await api.patch<User>('/users/me/email', data);
    // Update local storage
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, email: response.data.email, emailVerified: false };
      const sanitizedUser = this.sanitizeUserForStorage(updatedUser);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
    }
    return response.data;
  }

  async addOrganizerRole(): Promise<User> {
    const response = await api.patch<User>('/users/me/add-organizer-role');
    // Update local storage with new roles
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...response.data };
      const sanitizedUser = this.sanitizeUserForStorage(updatedUser);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
    }
    return response.data;
  }

  async updatePhone(data: { newPhone: string; password: string }): Promise<User> {
    const response = await api.patch<User>('/users/me/phone', data);
    // Update local storage
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, phone: response.data.phone, phoneVerified: false };
      const sanitizedUser = this.sanitizeUserForStorage(updatedUser);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
    }
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>('/users/me/password', data);
    return response.data;
  }

  async updateLocation(data: { country?: string; city?: string; address?: string }): Promise<User> {
    const response = await api.patch<User>('/users/me/location', data);
    // Update local storage
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, metadata: response.data.metadata };
      const sanitizedUser = this.sanitizeUserForStorage(updatedUser);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
    }
    return response.data;
  }

  async updateInterests(data: { interestedEventCategories: string[] }): Promise<User> {
    const response = await api.patch<User>('/users/me/interests', data);
    // Update local storage
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, interestedEventCategories: response.data.interestedEventCategories };
      const sanitizedUser = this.sanitizeUserForStorage(updatedUser);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
    }
    return response.data;
  }

  async updateHostingTypes(data: { hostingEventTypes: string[] }): Promise<User> {
    const response = await api.patch<User>('/users/me/hosting-types', data);
    // Update local storage
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, hostingEventTypes: response.data.hostingEventTypes };
      const sanitizedUser = this.sanitizeUserForStorage(updatedUser);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
    }
    return response.data;
  }
}

export default new AuthService();
