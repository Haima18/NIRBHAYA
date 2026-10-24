import { useState, useEffect, useCallback } from 'react';
import { UserProfile, AuthSession } from '@/types';
import { authService } from '@/services/auth/authService';

export function useAuth() {
  const [session, setSession] = useState<AuthSession>(() => authService.getSession());

  useEffect(() => {
    const unsubscribe = authService.subscribe(newSession => {
      setSession(newSession);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, pass: string, remember = true) => {
    return await authService.login(email, pass, remember);
  }, []);

  const signup = useCallback(async (name: string, email: string, phone: string, password: string) => {
    return await authService.signup(name, email, phone, password);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    return await authService.updateProfile(updates);
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<UserProfile>) => {
    return await authService.updatePreferences(updates);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return await authService.changePassword(currentPassword, newPassword);
  }, []);

  const deleteAccount = useCallback(async (password: string) => {
    return await authService.deleteAccount(password);
  }, []);

  return {
    user: session.user,
    isAuthenticated: session.isAuthenticated,
    login,
    signup,
    logout,
    updateProfile,
    updatePreferences,
    changePassword,
    deleteAccount
  };
}
