import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@/components/ConfirmDialog.jsx';
import UsuarioTable from '@/components/UsuarioTable.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import { excluirUsuario, listarUsuarios } from '@/services/usuariosService.js';
import { usuarioMatchesBusca } from '@/services/usuarioLabels.js';
import styles from './UsuariosListPage.module.css';

export default function UsuariosListPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busca, setBusca] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const lista = await listarUsuarios();
        if (!cancelled) {
          setUsuarios(lista);
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
        setUsuarios([]);
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
  }, [logout, navigate, reloadToken]);

  const filtrados = useMemo(
    () => usuarios.filter((usuario) => usuarioMatchesBusca(usuario, busca)),
    [usuarios, busca],
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
      await excluirUsuario(toDelete.idUsuario);
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
      if (err.status === 404) {
        setReloadToken((token) => token + 1);
      }
    } finally {
      setDeleting(false);
    }
  }

  const filtrosAtivos = Boolean(busca.trim());
  const emptyMessage = filtrosAtivos
    ? 'Nenhum usuário encontrado com essa busca.'
    : 'Nenhum usuário cadastrado.';

  return (
    <section className={styles.card}>
      <header className={styles.heading}>
        <h1>Usuários</h1>
        <p>Consulte e exclua as contas de usuários do sistema.</p>
      </header>

      <div className={styles.toolbar}>
        <label className={styles.search} htmlFor="busca-usuario">
          <span className={styles.srOnly}>Buscar por nome, e-mail ou contato</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" />
          </svg>
          <input
            id="busca-usuario"
            type="search"
            placeholder="Buscar por nome, e-mail ou contato..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </label>
      </div>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className={styles.status} aria-busy="true">
          Carregando usuários…
        </p>
      ) : null}

      {!loading && !error && filtrados.length === 0 ? (
        <p className={styles.status}>{emptyMessage}</p>
      ) : null}

      {!loading && filtrados.length > 0 ? (
        <UsuarioTable usuarios={filtrados} onDelete={setToDelete} />
      ) : null}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Excluir usuário"
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
