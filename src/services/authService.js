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

export function unmaskPhone(value) {
  return String(value).replace(/\D/g, '').slice(0, 11);
}

export function maskPhone(value) {
  const digits = unmaskPhone(value);
  if (digits.length === 0) {
    return '';
  }
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isPhoneValid(value) {
  const digits = unmaskPhone(value);
  return digits.length === 10 || digits.length === 11;
}

export function loginOng({ email, senha }) {
  return requestJson('/auth/ongs/login', {
    method: 'POST',
    body: { email, senha },
  });
}

export function cadastrarOng({ nome, email, senha, contato, cidade }) {
  return requestJson('/auth/ongs/cadastro', {
    method: 'POST',
    body: { nome, email, senha, contato, cidade },
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
