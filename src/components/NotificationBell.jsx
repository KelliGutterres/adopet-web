import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import {
  listarNotificacoes,
  marcarNotificacaoLida,
  marcarTodasNotificacoesLidas,
} from '@/services/notificacoesService.js';
import styles from './NotificationBell.module.css';

const POLL_MS = 30000;

function formatarData(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function textoBadge(naoLidas) {
  if (naoLidas > 9) {
    return '9+';
  }
  return String(naoLidas);
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const [notificacoes, setNotificacoes] = useState([]);
  const [error, setError] = useState('');

  const aplicar401 = useCallback(
    (err) => {
      if (err?.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return true;
      }
      return false;
    },
    [logout, navigate],
  );

  const load = useCallback(async () => {
    try {
      const dados = await listarNotificacoes();
      setNaoLidas(dados.naoLidas);
      setNotificacoes(dados.notificacoes);
      setError('');
    } catch (err) {
      if (aplicar401(err)) {
        return;
      }
      setError(err.message || 'Erro na requisição');
    }
  }, [aplicar401]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onPointerDown(event) {
      if (!wrapRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function abrirItem(item) {
    try {
      if (!item.lida) {
        await marcarNotificacaoLida(item.idNotificacao);
      }
    } catch (err) {
      if (aplicar401(err)) {
        return;
      }
      setError(err.message || 'Erro na requisição');
      return;
    }

    setOpen(false);
    await load();
    if (item.animal?.idAnimal) {
      const status = item.animal.status || 'A';
      navigate(`/painel/animais/${item.animal.idAnimal}/detalhes?status=${status}`);
    }
  }

  async function marcarTodas() {
    try {
      await marcarTodasNotificacoesLidas();
      await load();
    } catch (err) {
      if (aplicar401(err)) {
        return;
      }
      setError(err.message || 'Erro na requisição');
    }
  }

  const rotulo =
    naoLidas > 0
      ? `Notificações, ${naoLidas} não ${naoLidas === 1 ? 'lida' : 'lidas'}`
      : 'Notificações';

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        className={styles.bell}
        type="button"
        aria-label={rotulo}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen((atual) => !atual);
          load();
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {naoLidas > 0 ? <span className={styles.badge}>{textoBadge(naoLidas)}</span> : null}
      </button>

      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Notificações">
          <div className={styles.head}>
            <strong>Notificações</strong>
            <button
              className={styles.markAll}
              type="button"
              onClick={marcarTodas}
              disabled={naoLidas === 0}
            >
              Marcar todas como lidas
            </button>
          </div>
          {error ? <p className={`${styles.static} ${styles.alert}`}>{error}</p> : null}
          {notificacoes.length === 0 && !error ? (
            <p className={styles.static}>Nenhuma notificação ainda.</p>
          ) : (
            <ul className={styles.list}>
              {notificacoes.map((item) => (
                <li key={item.idNotificacao}>
                  <button
                    className={`${styles.item} ${item.lida ? '' : styles.unread}`}
                    type="button"
                    onClick={() => abrirItem(item)}
                  >
                    <span className={styles.title}>{item.titulo}</span>
                    <span className={styles.message}>{item.mensagem}</span>
                    <span className={styles.meta}>
                      {formatarData(item.criadoEm)}
                      {item.animal ? '' : ' · Animal não está mais no sistema'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
