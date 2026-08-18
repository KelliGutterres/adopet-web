export const TOKEN_KEY = 'adopet.token';
export const ONG_KEY = 'adopet.ong';

export function readStoredOng() {
  const raw = localStorage.getItem(ONG_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSession(token, ong) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ONG_KEY, JSON.stringify(ong));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ONG_KEY);
}

export function readStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}
