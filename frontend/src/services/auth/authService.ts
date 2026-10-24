/**
 * Server-backed account authentication with a browser-local profile cache.
 */
import { UserProfile, AuthSession } from '@/types';
import { storageService } from '@/services/storage/storageService';

const AUTH_KEY = 'nirbhaya_auth_session';

type AuthListener = (session: AuthSession) => void;
type AuthResponse = { user?: Partial<UserProfile>; error?: string };
const listeners: Set<AuthListener> = new Set();
let currentSession: AuthSession = { user: null, isAuthenticated: false };

function notifyListeners(session: AuthSession) {
  currentSession = session;
  listeners.forEach(cb => cb(session));
}

async function requestAuth(path: string, method: string, body?: Record<string, unknown>): Promise<AuthResponse> {
  const response = await fetch(`/api/auth/${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json() as AuthResponse;
  if (!response.ok) {
    throw new Error(data.error || 'The account service could not complete this request.');
  }
  return data;
}

function profileFromServer(serverProfile: Partial<UserProfile>): UserProfile {
  const cachedProfile = storageService.getProfile();
  const sameAccount = cachedProfile.email?.toLowerCase() === serverProfile.email?.toLowerCase();
  return {
    ...(sameAccount ? cachedProfile : {}),
    id: serverProfile.id || '',
    name: serverProfile.name || '',
    email: serverProfile.email || '',
    phone: serverProfile.phone || '',
    quickExitUrl: sameAccount ? cachedProfile.quickExitUrl : serverProfile.quickExitUrl || 'https://www.accuweather.com',
    aiProcessingConsent: sameAccount ? cachedProfile.aiProcessingConsent : false,
    locationConsent: sameAccount ? cachedProfile.locationConsent : false,
    discreetMode: sameAccount ? cachedProfile.discreetMode : false,
    preferredLanguage: sameAccount ? cachedProfile.preferredLanguage : serverProfile.preferredLanguage || 'English',
    joinedDate: serverProfile.joinedDate
  };
}

function setAuthenticatedUser(serverProfile: Partial<UserProfile>): UserProfile {
  storageService.setUserScope(serverProfile.id || null);
  const user = profileFromServer(serverProfile);
  storageService.saveProfile(user);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, isAuthenticated: true }));
  notifyListeners({ user, isAuthenticated: true });
  return user;
}

function clearLocalSession() {
  localStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_KEY);
  storageService.setUserScope(null);
  notifyListeners({ user: null, isAuthenticated: false });
}

export const authService = {
  getSession(): AuthSession {
    return currentSession;
  },

  async restoreSession(): Promise<AuthSession> {
    try {
      const response = await requestAuth('me', 'GET');
      if (!response.user) {
        throw new Error('The account service returned an invalid session response.');
      }
      setAuthenticatedUser(response.user);
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required.') {
        clearLocalSession();
        return currentSession;
      }
      throw error;
    }
    return currentSession;
  },

  async login(email: string, password: string, rememberMe = true): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const response = await requestAuth('login', 'POST', { email, password, rememberMe });
      if (!response.user) {
        return { success: false, error: 'The account service returned an invalid login response.' };
      }
      return { success: true, user: setAuthenticatedUser(response.user) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unable to sign in.' };
    }
  },

  async signup(name: string, email: string, phone: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const response = await requestAuth('register', 'POST', { name, email, phone, password });
      if (!response.user) {
        return { success: false, error: 'The account service returned an invalid registration response.' };
      }
      return { success: true, user: setAuthenticatedUser(response.user) };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unable to register.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await requestAuth('logout', 'POST');
    } finally {
      clearLocalSession();
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = currentSession.user;
    if (!currentUser) {
      throw new Error('Please sign in again before updating your profile.');
    }
    const accountFields = { ...currentUser, ...updates };
    const response = await requestAuth('profile', 'PUT', {
      name: accountFields.name,
      email: accountFields.email,
      phone: accountFields.phone
    });
    if (!response.user) {
      throw new Error('The account service returned an invalid profile response.');
    }
    const serverFields = profileFromServer(response.user);
    const updated = { ...serverFields, ...updates, id: serverFields.id };
    storageService.saveProfile(updated);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user: updated, isAuthenticated: true }));
    notifyListeners({ user: updated, isAuthenticated: true });
    return updated;
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
