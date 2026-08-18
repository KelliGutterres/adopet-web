import { requestJson } from './api.js';

export const MIN_SENHA = 6;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailValid(email) {
  return EMAIL_REGEX.test(String(email).trim());
}

export function loginOng({ email, senha }) {
  return requestJson('/auth/ongs/login', {
    method: 'POST',
    body: { email, senha },
  });
}

export function redefinirSenhaOng({ email, senha }) {
  return requestJson('/auth/ongs/senha', {
    method: 'PUT',
    body: { email, senha },
  });
}

export function me() {
  return requestJson('/auth/me');
}
