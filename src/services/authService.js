import { requestJson } from './api.js';

export const MIN_SENHA = 6;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const UF_REGEX = /^[A-Z]{2}$/;

export function isEmailValid(email) {
  return EMAIL_REGEX.test(String(email).trim());
}

export function isUfValid(uf) {
  return UF_REGEX.test(String(uf).trim().toUpperCase());
}

export function loginOng({ email, senha }) {
  return requestJson('/auth/ongs/login', {
    method: 'POST',
    body: { email, senha },
  });
}

export function cadastrarOng({ nome, email, senha, cidade }) {
  return requestJson('/auth/ongs/cadastro', {
    method: 'POST',
    body: { nome, email, senha, cidade },
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
