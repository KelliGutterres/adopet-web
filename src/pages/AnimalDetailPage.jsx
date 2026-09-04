import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import AnimalPhoto from '@/components/AnimalPhoto.jsx';
import { buscarAnimalPorId } from '@/services/animaisService.js';
import {
  labelCidade,
  labelEspecie,
  labelIdade,
  labelPorte,
  labelResponsavel,
  labelStatus,
} from '@/services/animalLabels.js';
import { normalizeStatus, pathFromStatus } from './animaisListConfig.js';
import styles from './AnimalDetailPage.module.css';

function parseIdAnimal(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

export default function AnimalDetailPage() {
  const { idAnimal: idParam } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const idAnimal = parseIdAnimal(idParam);
  const statusHint = normalizeStatus(searchParams.get('status'));

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const status = animal ? normalizeStatus(animal.status) : statusHint;

  useEffect(() => {
    if (!idAnimal) {
      setLoading(false);
      setAnimal(null);
      setError('Animal não encontrado.');
      setCanRetry(false);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      setCanRetry(false);
      try {
        const next = await buscarAnimalPorId(idAnimal);
        if (cancelled) {
          return;
        }
        if (!next) {
          setAnimal(null);
          setError('Animal não encontrado.');
          return;
        }
        setAnimal(next);
        const nextStatus = normalizeStatus(next.status);
        const currentStatus = new URLSearchParams(window.location.search).get('status');
        if (currentStatus !== nextStatus) {
          setSearchParams({ status: nextStatus }, { replace: true });
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
        setAnimal(null);
        const notFound = err.status === 404 || err.status === 400;
        setError(notFound ? 'Animal não encontrado.' : err.message || 'Erro na requisição');
        setCanRetry(!notFound);
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
  }, [idAnimal, logout, navigate, reloadToken, setSearchParams]);

  function goBack() {
    navigate(pathFromStatus(status));
  }

  const responsavel = animal ? labelResponsavel(animal) : null;
  const statusLabel = animal ? labelStatus(animal.status) : '';

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Detalhes do animal</h1>
        <p>Consulte as informações cadastradas.</p>
      </header>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className={styles.status} aria-busy="true">
          Carregando detalhes…
        </p>
      ) : null}

      {!loading && error ? (
        <div className={styles.footer}>
          <button className={styles.cancel} type="button" onClick={goBack}>
            Voltar à lista
          </button>
          {canRetry ? (
            <button
              className={styles.submit}
              type="button"
              onClick={() => setReloadToken((token) => token + 1)}
            >
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && animal ? (
        <>
          <section className={styles.hero}>
            <AnimalPhoto
              src={animal.urlImagem}
              nome={animal.nome}
              variant="detail"
              alt={`Foto de ${animal.nome}`}
            />
            <div>
              <h2 className={styles.nome}>{animal.nome}</h2>
              <p className={styles.meta}>
                <span>ID: #{animal.idAnimal}</span>
                {statusLabel ? <span className={styles.chip}>{statusLabel}</span> : null}
              </p>
            </div>
          </section>

          <div className={styles.grid}>
            <section className={styles.card}>
              <h2>Informações básicas</h2>
              <dl className={styles.fields}>
                <div>
                  <dt>Espécie</dt>
                  <dd>{labelEspecie(animal.especie)}</dd>
                </div>
                <div>
                  <dt>Raça</dt>
                  <dd>{animal.raca?.nome || '—'}</dd>
                </div>
                <div>
                  <dt>Idade</dt>
                  <dd>{labelIdade(animal.idade)}</dd>
                </div>
                <div>
                  <dt>Porte</dt>
                  <dd>{labelPorte(animal.porte)}</dd>
                </div>
                <div className={styles.full}>
                  <dt>Descrição</dt>
                  <dd className={styles.descricao}>{animal.descricao || '—'}</dd>
                </div>
                {responsavel?.value ? (
                  <div className={styles.full}>
                    <dt>{responsavel.label}</dt>
                    <dd>{responsavel.value}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className={styles.card}>
              <h2>Localização</h2>
              <dl className={styles.fields}>
                <div className={styles.full}>
                  <dt>Localização</dt>
                  <dd>{labelCidade(animal.cidade)}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancel} type="button" onClick={goBack}>
              Voltar
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
