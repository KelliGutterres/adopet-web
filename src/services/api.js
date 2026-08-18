import { TOKEN_KEY } from './session.js';

const DEFAULT_API_URL = 'http://localhost:3000';
const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar à API. Verifique se o backend está no ar.';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function apiUrl(path = '') {
  const base = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function readToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function request(path, options = {}) {
  const { method = 'GET', headers = {}, body, ...rest } = options;
  const token = readToken();

  let response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE);
  }

  return response;
}

export async function requestJson(path, options = {}) {
  const response = await request(path, options);

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.error?.message || 'Erro na requisição';
    throw new ApiError(message, response.status);
  }

  return data;
}
