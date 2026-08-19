import { requestJson } from './api.js';

export async function listarAnimais({ status } = {}) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const data = await requestJson(`/animais${query}`);
  return Array.isArray(data?.animais) ? data.animais : [];
}
