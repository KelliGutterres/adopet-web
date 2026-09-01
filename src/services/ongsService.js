import { requestJson } from './api.js';

export async function buscarMe() {
  const data = await requestJson('/ongs/me');
  return data?.ong ?? null;
}

export async function atualizarMe({ nome, email, cidade }) {
  const data = await requestJson('/ongs/me', {
    method: 'PATCH',
    body: { nome, email, cidade },
  });
  return data?.ong ?? null;
}
