const DEFAULT_API_URL = 'http://localhost:3000';

export function apiUrl(path = '') {
  const base = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function request(path, options = {}) {
  const { method = 'GET', headers = {}, body, ...rest } = options;

  const response = await fetch(apiUrl(path), {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  return response;
}
