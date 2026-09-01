import { requestJson } from './api.js';

export async function listarUsuarios() {
  const data = await requestJson('/usuarios');
  return Array.isArray(data?.usuarios) ? data.usuarios : [];
}

export async function excluirUsuario(id) {
  await requestJson(`/usuarios/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
