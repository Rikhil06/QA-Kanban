// utils/auth.ts
import Cookies from 'js-cookie';

const SESSION_KEY = 'has_session';

// Returns a truthy string when a session exists, undefined otherwise.
// The actual JWT is in an httpOnly cookie managed by the backend.
export const getToken = (): string | undefined => {
  return Cookies.get(SESSION_KEY);
};

// Called after login/register. The backend already set the httpOnly JWT cookie
// via Set-Cookie — we just record the readable session indicator here.
export const setToken = (_token: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  Cookies.set(SESSION_KEY, '1', {
    path: '/',
    expires: 7,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
};

// Clears the readable indicator and asks the backend to clear the httpOnly cookie.
export const clearToken = () => {
  Cookies.remove(SESSION_KEY, { path: '/' });
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl) {
    fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
  }
};
