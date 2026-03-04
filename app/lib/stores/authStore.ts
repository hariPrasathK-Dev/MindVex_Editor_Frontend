import { map } from 'nanostores';
import type { User } from '~/types/backend';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authStore = map<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
});

export function setAuth(token: string, user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  authStore.set({ user, token, isAuthenticated: true, isLoading: false });
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  authStore.set({ user: null, token: null, isAuthenticated: false, isLoading: false });
}

export function initAuth() {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    if (urlToken) {
      localStorage.setItem('auth_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);

      // Use the configured backend URL from environment
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';
      fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${urlToken}` },
      })
        .then((res) => res.json() as Promise<User>)
        .then((user) => {
          setAuth(urlToken, user);
        })
        .catch((err) => {
          console.error('Failed to fetch user', err);
          clearAuth();
        });

      return;
    }

    const token = localStorage.getItem('auth_token');

    if (token) {
      /*
       * Always validate the stored token against the backend
       * Use the configured backend URL from environment
       */
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';
      fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) {
            // Token is invalid/expired — clear stale auth and force re-login
            console.warn('Stored token is invalid, clearing auth');
            clearAuth();

            return null;
          }

          return res.json();
        })
        .then((user) => {
          if (user) {
            setAuth(token, user as User);
          }
        })
        .catch((err) => {
          console.error('Failed to validate token', err);
          clearAuth();
        });
    } else {
      authStore.set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  }
}

export function getAuthToken(): string | null {
  return authStore.get().token;
}

export function isAuthenticated(): boolean {
  return authStore.get().isAuthenticated;
}

export function getCurrentUser() {
  return authStore.get().user;
}
