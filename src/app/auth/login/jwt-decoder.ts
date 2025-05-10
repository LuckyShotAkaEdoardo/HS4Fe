import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  id: number;
  username: string;
}

export function getDecodedToken(): any {
  const token = localStorage.getItem('token');
  if (!token) return {};

  try {
    return jwtDecode<DecodedToken>(token);
  } catch (err) {
    console.error('Errore nella decodifica del token:', err);
    return {};
  }
}
