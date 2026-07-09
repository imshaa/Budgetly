import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, profileAPI } from "../services/api";

interface AuthUser {
  email: string;
}

interface ProfileData {
  username?: string;
  profile_image_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: ProfileData | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, confirmPassword: string, username?: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  pendingEmail: string | null;
  setPendingEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // Restore session from localStorage on mount
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('user_email');
    if (token && email) {
      // Optionally validate token by fetching user data
      setUser({ email });
      refreshProfile();
    } else {
      // Clear any partial state
      localStorage.removeItem('user_email');
    }
  }, []);

  const refreshProfile = async () => {
    try {
      const data = await profileAPI.getProfile();
      if (data && !data.error) {
        setProfile(data);
      }
    } catch {
      // no profile available yet
    }
  };

  const login = async (email: string, password: string) => {
    const data = await authAPI.login(email, password);
    if (data.error) return { success: false, error: data.error };
    if (!data.access || !data.refresh) return { success: false, error: 'Invalid login response' };
    localStorage.setItem('user_email', email);
    setUser({ email });
    await refreshProfile();
    return { success: true };
  };

  const signup = async (email: string, password: string, confirmPassword: string, username?: string) => {
    const data = await authAPI.signup(email, password, confirmPassword, username);
    if (data.error) return { success: false, error: data.error };
    setPendingEmail(email);
    return { success: true };
  };

  const verifyEmail = async (email: string, otp: string) => {
    const data = await authAPI.verifyEmail(email, otp);
    if (data.error) return { success: false, error: data.error };
    return { success: true };
  };

  const logout = () => {
    authAPI.logout();
    localStorage.removeItem('user_email');
    setUser(null);
    setProfile(null);
    // Note: Navigation should be handled by the component calling logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoggedIn: !!user,
        login,
        signup,
        verifyEmail,
        logout,
        refreshProfile,
        pendingEmail,
        setPendingEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}