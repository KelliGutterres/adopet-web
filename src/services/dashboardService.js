import { requestJson } from './api.js';

const PERIODOS = new Set(['7d', '30d', '90d']);

export async function obterMetricasDashboard(periodo) {
  const chave = PERIODOS.has(periodo) ? periodo : '7d';
  const data = await requestJson(`/dashboard?periodo=${chave}`);
  const metricas = data?.metricas || {};

  return {
    periodo: chave,
    adocao: numero(metricas.adocao),
    encontrados: numero(metricas.encontrados),
    perdidos: numero(metricas.perdidos),
    adotados: numero(metricas.adotados),
  };
}

function numero(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}
