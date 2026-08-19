import { requestJson } from './api.js';

export async function listarAnimais({ status } = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const data = await requestJson(`/animais${query}`);
  return Array.isArray(data?.animais) ? data.animais : [];
}

export async function buscarAnimalPorId(id) {
  const data = await requestJson(`/animais/${encodeURIComponent(id)}`);
  return data?.animal ?? null;
}

export async function criarAnimal(body) {
  const data = await requestJson('/animais', {
    method: 'POST',
    body,
  });
  return data?.animal ?? null;
}

export async function atualizarAnimal(id, body) {
  const data = await requestJson(`/animais/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  });
  return data?.animal ?? null;
}

export async function excluirAnimal(id) {
  await requestJson(`/animais/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
