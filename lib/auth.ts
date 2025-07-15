// utils/auth.ts
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';

export const getToken = () => {
  return Cookies.get(TOKEN_KEY) || null;
};

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { path: '/', secure: true, sameSite: 'strict' });
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY, { path: '/' });
};

export const useLogout = () => {
  const router = useRouter();

  return () => {
    clearToken();
    router.push('/login');
  };
};
