import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { obterMetricasDashboard } from '@/services/dashboardService.js';
import styles from './DashboardPage.module.css';

const FILTROS = [
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '1 mês' },
  { id: '90d', label: '3 meses' },
];

const CARDS = [
  { key: 'adocao', label: 'Para adoção', hint: 'Cadastrados no período' },
  { key: 'encontrados', label: 'Encontrados', hint: 'Cadastrados no período' },
  { key: 'perdidos', label: 'Perdidos', hint: 'Cadastrados no período' },
  { key: 'adotados', label: 'Adotados', hint: 'Saíram da adoção no período' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [periodo, setPeriodo] = useState('7d');
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const dados = await obterMetricasDashboard(periodo);
        if (!cancelled) {
          setMetricas(dados);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setMetricas(null);
        setError(err.message || 'Erro na requisição');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [logout, navigate, periodo, reloadToken]);

  return (
    <section className={styles.card}>
      <header className={styles.heading}>
        <h1>Dashboard</h1>
        <p>
          Cadastros de adoção, encontrados e perdidos no período, e adoções medidas
          pelos animais para adoção que foram excluídos.
        </p>
      </header>

      <div className={styles.filters} role="group" aria-label="Período">
        {FILTROS.map((filtro) => {
          const ativo = periodo === filtro.id;
          return (
            <button
              key={filtro.id}
              type="button"
              className={`${styles.filter} ${ativo ? styles.filterActive : ''}`}
              aria-pressed={ativo}
              onClick={() => setPeriodo(filtro.id)}
            >
              {filtro.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className={styles.errorBox}>
          <p className={styles.alert} role="alert">
            {error}
          </p>
          <button
            className={styles.retry}
            type="button"
            onClick={() => setReloadToken((token) => token + 1)}
          >
            Tentar de novo
          </button>
        </div>
      ) : null}

      {loading ? <p className={styles.status}>Carregando…</p> : null}

      {!loading && !error && metricas ? (
        <div className={styles.metrics}>
          {CARDS.map((card) => (
            <article key={card.key} className={styles.metric}>
              <p className={styles.value}>{metricas[card.key]}</p>
              <h2 className={styles.label}>{card.label}</h2>
              <p className={styles.hint}>{card.hint}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
