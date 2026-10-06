import { requestJson } from './api.js';

export async function listarNotificacoes() {
  const data = await requestJson('/notificacoes');
  return {
    naoLidas: Number(data?.naoLidas) || 0,
    notificacoes: Array.isArray(data?.notificacoes) ? data.notificacoes : [],
  };
}

export function marcarNotificacaoLida(idNotificacao) {
  return requestJson(`/notificacoes/${idNotificacao}/lida`, { method: 'PATCH' });
}

export function marcarTodasNotificacoesLidas() {
  return requestJson('/notificacoes/lidas', { method: 'PATCH' });
}
