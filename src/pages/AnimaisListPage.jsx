import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AnimalTable from '@/components/AnimalTable.jsx';
import ConfirmDialog from '@/components/ConfirmDialog.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import { excluirAnimal, listarAnimais } from '@/services/animaisService.js';
import { animalMatchesFilters } from '@/services/animalLabels.js';
import { screenFromSituacao } from './animaisListConfig.js';
import styles from './AnimaisListPage.module.css';

export default function AnimaisListPage() {
  const { situacao } = useParams();
  const screen = screenFromSituacao(situacao);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [especie, setEspecie] = useState('');
  const [porte, setPorte] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setBusca('');
    setEspecie('');
    setPorte('');
    setToDelete(null);
  }, [situacao]);

  useEffect(() => {
    const current = screenFromSituacao(situacao);
    if (!current) {
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const lista = await listarAnimais({ status: current.status });
        if (!cancelled) {
          setAnimais(lista);
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
        setAnimais([]);
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
  }, [situacao, logout, navigate, reloadToken]);

  const filtrados = useMemo(
    () => animais.filter((animal) => animalMatchesFilters(animal, { busca, especie, porte })),
    [animais, busca, especie, porte],
  );

  const closeDelete = useCallback(() => {
    if (!deleting) {
      setToDelete(null);
    }
  }, [deleting]);

  async function handleConfirmDelete() {
    if (!toDelete) {
      return;
    }

    setDeleting(true);
    setError('');
    try {
      await excluirAnimal(toDelete.idAnimal);
      setToDelete(null);
      setReloadToken((token) => token + 1);
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Erro na requisição');
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  if (!screen) {
    return <Navigate to="/painel/animais/adocao" replace />;
  }

  const filtrosAtivos = Boolean(busca.trim() || especie || porte);
  const emptyMessage = filtrosAtivos
    ? 'Nenhum animal encontrado com esses filtros.'
    : screen.empty;

  return (
    <section className={styles.card}>
      <header className={styles.heading}>
        <h1>{screen.title}</h1>
        <p>{screen.subtitle}</p>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search} htmlFor="busca-animal">
          <span className={styles.srOnly}>Buscar por nome, raça ou espécie</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
          </svg>
          <input
            id="busca-animal"
            type="search"
            placeholder="Buscar por nome, raça ou espécie..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </label>

        <label className={styles.select}>
          <span className={styles.srOnly}>Espécie</span>
          <select value={especie} onChange={(event) => setEspecie(event.target.value)}>
            <option value="">Espécie: todas</option>
            <option value="CAO">Cachorro</option>
            <option value="GATO">Gato</option>
          </select>
        </label>

        <label className={styles.select}>
          <span className={styles.srOnly}>Porte</span>
          <select value={porte} onChange={(event) => setPorte(event.target.value)}>
            <option value="">Porte: todos</option>
            <option value="P">Pequeno</option>
            <option value="M">Médio</option>
            <option value="G">Grande</option>
          </select>
        </label>

        <button
          className={styles.cadastrar}
          type="button"
          onClick={() => navigate(`/painel/animais/novo?status=${screen.status}`)}
        >
          + Cadastrar novo animal
        </button>
      </div>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className={styles.status} aria-busy="true">
          Carregando animais…
        </p>
      ) : null}

      {!loading && !error && filtrados.length === 0 ? (
        <p className={styles.status}>{emptyMessage}</p>
      ) : null}

      {!loading && filtrados.length > 0 ? (
        <AnimalTable
          animais={filtrados}
          onOpen={(animal) =>
            navigate(`/painel/animais/${animal.idAnimal}/detalhes?status=${screen.status}`)
          }
          onEdit={(animal) =>
            navigate(`/painel/animais/${animal.idAnimal}/editar?status=${screen.status}`)
          }
          onDelete={setToDelete}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir animal"
        confirmLabel="Excluir"
        danger
        loading={deleting}
        onCancel={closeDelete}
        onConfirm={handleConfirmDelete}
      >
        Excluir <strong>{toDelete?.nome}</strong>? Esta ação não pode ser desfeita.
      </ConfirmDialog>
    </section>
  );
}
