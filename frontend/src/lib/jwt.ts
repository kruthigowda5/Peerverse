import { jwtDecode } from 'jwt-decode';

export function getUserIdFromAccess(): string | null {
  if (typeof window === 'undefined') return null;
  const access = localStorage.getItem('access');
  if (!access) return null;
  try {
    const payload = jwtDecode<{ user_id?: string | number }>(access);
    return payload.user_id ? String(payload.user_id) : null;
  } catch {
    return null;
  }
}
