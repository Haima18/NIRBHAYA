/**
 * Server-backed account authentication with a browser-local profile cache.
 * Preferences (AI consent, location consent, language, quick exit) are owned by
 * the server and cached only for fast rendering.
 */
import { UserProfile, AuthSession } from '@/types';
import { storageService } from '@/services/storage/storageService';

const AUTH_KEY = 'nirbhaya_auth_session';

type AuthListener = (session: AuthSession) => void;
type AuthResponse = {
  user?: Partial<UserProfile>;
  error?: string;
  message?: string;
  success?: boolean;
  devResetToken?: string;
  devNotice?: string;
  emailDeliveryConfigured?: boolean;
};
const listeners: Set<AuthListener> = new Set();
let currentSession: AuthSession = { user: null, isAuthenticated: false };

function notifyListeners(session: AuthSession) {
  currentSession = session;
  listeners.forEach(cb => cb(session));
}

async function requestAuth(path: string, method: string, body?: Record<string, unknown>): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('The account service is unreachable. Check that the backend is running.');
  }

  const data = await response.json().catch(() => ({})) as AuthResponse;
  if (!response.ok) {
    throw new Error(data.error || 'The account service could not complete this request.');
  }
  return data;
}

function profileFromServer(serverProfile: Partial<UserProfile>): UserProfile {
  return {
    id: serverProfile.id || '',
    name: serverProfile.name || '',
    email: serverProfile.email || '',
    phone: serverProfile.phone || '',
    bio: serverProfile.bio || '',
    quickExitUrl: serverProfile.quickExitUrl || 'https://www.accuweather.com',
    aiProcessingConsent: Boolean(serverProfile.aiProcessingConsent),
    locationConsent: Boolean(serverProfile.locationConsent),
    discreetMode: Boolean(serverProfile.discreetMode),
    preferredLanguage: serverProfile.preferredLanguage || 'English',
    joinedDate: serverProfile.joinedDate
  };
}

function persistSession(user: UserProfile) {
  storageService.saveProfile(user);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ user, isAuthenticated: true }));
  notifyListeners({ user, isAuthenticated: true });
}

function setAuthenticatedUser(serverProfile: Partial<UserProfile>): UserProfile {
  storageService.setUserScope(serverProfile.id || null);
  const user = profileFromServer(serverProfile);
  persistSession(user);
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
      // 401 = not logged in (expected on first visit / after logout).
      // Any other error (500, network failure, CORS issue, etc.) should also
      // be treated as "not authenticated" so the app lands on the welcome page
      // instead of showing an unrecoverable error screen.
      clearLocalSession();
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
    const merged = { ...currentUser, ...updates };
    const response = await requestAuth('profile', 'PUT', {
      name: merged.name,
      email: merged.email,
      phone: merged.phone,
      bio: merged.bio || '',
      preferences: {
        quickExitUrl: merged.quickExitUrl,
        aiProcessingConsent: merged.aiProcessingConsent,
        locationConsent: merged.locationConsent,
        discreetMode: merged.discreetMode,
        preferredLanguage: merged.preferredLanguage
      }
    });
    if (!response.user) {
      throw new Error('The account service returned an invalid profile response.');
    }
    const updated = profileFromServer(response.user);
    persistSession(updated);
    return updated;
  },

  async updatePreferences(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = currentSession.user;
    if (!currentUser) {
      throw new Error('Please sign in again before changing preferences.');
    }
    const merged = { ...currentUser, ...updates };
    const response = await requestAuth('preferences', 'PATCH', {
      quickExitUrl: merged.quickExitUrl,
      aiProcessingConsent: merged.aiProcessingConsent,
      locationConsent: merged.locationConsent,
      discreetMode: merged.discreetMode,
      preferredLanguage: merged.preferredLanguage
    });
    if (!response.user) {
      throw new Error('The account service returned an invalid preference response.');
    }
    const updated = profileFromServer(response.user);
    persistSession(updated);
    return updated;
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    return requestAuth('forgot-password', 'POST', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    return requestAuth('reset-password', 'POST', { token, newPassword });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    return requestAuth('password', 'PUT', { currentPassword, newPassword });
  },

  async deleteAccount(password: string): Promise<void> {
    await requestAuth('account', 'DELETE', { password });
    storageService.wipeAllData();
    clearLocalSession();
  },

  subscribe(listener: AuthListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};
