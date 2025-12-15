// utils/auth.ts
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';

export const getToken = () => {
  return Cookies.get(TOKEN_KEY) || null;
};

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { 
    path: '/', 
    secure: true, 
    sameSite: 'strict',
    expires: 7 
  });
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY, { path: '/' });
};
