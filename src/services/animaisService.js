import { ApiError, requestForm, requestJson } from './api.js';

function parseIdAnimal(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

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

export async function enviarImagem(id, file) {
  const idAnimal = parseIdAnimal(id);
  if (!idAnimal) {
    throw new ApiError('id inválido', 400);
  }
  if (!(file instanceof Blob) || file.size === 0) {
    throw new ApiError('imagem é obrigatório', 400);
  }

  const formData = new FormData();
  formData.append('imagem', file, 'foto.jpg');

  const data = await requestForm(`/animais/${idAnimal}/imagem`, formData);
  return data?.animal ?? null;
}

export async function removerImagem(id) {
  const idAnimal = parseIdAnimal(id);
  if (!idAnimal) {
    throw new ApiError('id inválido', 400);
  }

  await requestJson(`/animais/${idAnimal}/imagem`, {
    method: 'DELETE',
  });
}
