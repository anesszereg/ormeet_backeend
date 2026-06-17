import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginDto, RegisterDto, LoginWithCodeDto } from '../services/authService';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginDto) => Promise<void>;
  loginWithCode: (data: LoginWithCodeDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<{ user: User; token: string; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state — load from localStorage first, then refresh from API
  useEffect(() => {
    const initAuth = async () => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (currentUser && token) {
        setUser(currentUser);
        // Fetch fresh profile from the server in the background
        try {
          const freshUser = await authService.getCurrentUserFromServer();
          setUser(freshUser);
        } catch (err) {
          // Token may be expired — clear auth state
          authService.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginDto) => {
    const response = await authService.login(data);
    setUser(response.user);
  };

  const loginWithCode = async (data: LoginWithCodeDto) => {
    const response = await authService.loginWithCode(data);
    setUser(response.user);
  };

  const register = async (data: RegisterDto) => {
    const response = await authService.register(data);
    // Don't auto-login after registration - user must verify email first
    // Clear any stored token/user to ensure they can't access protected routes
    authService.logout();
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getCurrentUserFromServer();
      setUser(freshUser);
    } catch {
      // Fallback to localStorage if API call fails
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
  };

  const value: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithCode,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
