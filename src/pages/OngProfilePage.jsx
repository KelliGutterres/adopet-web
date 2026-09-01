import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { isEmailValid, isUfValid } from '@/services/authService.js';
import { atualizarMe, buscarMe } from '@/services/ongsService.js';
import styles from './OngProfilePage.module.css';

const DISCARD_MESSAGE =
  'Descartar alterações?\n\nAs alterações não salvas serão perdidas.';
const NOME_MAX = 100;

const EMPTY_FORM = {
  nome: '',
  email: '',
  cidade: '',
  uf: '',
};

function formFromOng(ong) {
  return {
    nome: ong?.nome || '',
    email: ong?.email || '',
    cidade: ong?.cidade?.nome || '',
    uf: (ong?.cidade?.uf || '').toUpperCase(),
  };
}

function normalizeForm(form) {
  return {
    nome: form.nome.trim(),
    email: form.email.trim().toLowerCase(),
    cidade: form.cidade.trim(),
    uf: form.uf.trim().toUpperCase(),
  };
}

function isDirty(form, snapshot) {
  return JSON.stringify(normalizeForm(form)) !== JSON.stringify(normalizeForm(snapshot));
}

function validate(form) {
  if (!form.nome.trim()) {
    return 'Informe o nome da ONG';
  }
  if (!isEmailValid(form.email)) {
    return 'Informe um e-mail válido';
  }
  if (!form.cidade.trim()) {
    return 'Informe a cidade';
  }
  if (!isUfValid(form.uf)) {
    return 'Informe a UF (2 letras, ex.: RS)';
  }
  return '';
}

export default function OngProfilePage() {
  const { atualizarOng, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [snapshot, setSnapshot] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const ong = await buscarMe();
        if (cancelled) {
          return;
        }
        if (!ong) {
          setError('ONG não encontrada');
          setLoaded(false);
          return;
        }
        const next = formFromOng(ong);
        setForm(next);
        setSnapshot(next);
        atualizarOng(ong);
        setLoaded(true);
      } catch (err) {
        if (cancelled) {
          return;
        }
        if (err.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setError(err.message || 'Erro na requisição');
        setLoaded(false);
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
  }, [atualizarOng, logout, navigate]);

  function updateField(field) {
    return (event) => {
      let value = event.target.value;
      if (field === 'uf') {
        value = value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
      }
      setSuccess('');
      setForm((current) => ({ ...current, [field]: value }));
    };
  }

  function handleCancel() {
    if (!isDirty(form, snapshot)) {
      return;
    }
    if (!window.confirm(DISCARD_MESSAGE)) {
      return;
    }
    setForm(snapshot);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!isDirty(form, snapshot)) {
      return;
    }

    const localError = validate(form);
    if (localError) {
      setError(localError);
      return;
    }

    const normalized = normalizeForm(form);
    setSubmitting(true);
    setSuccess('');

    try {
      const ong = await atualizarMe({
        nome: normalized.nome,
        email: normalized.email,
        cidade: { nome: normalized.cidade, uf: normalized.uf },
      });
      if (!ong) {
        setError('Erro na requisição');
        return;
      }
      const next = formFromOng(ong);
      setForm(next);
      setSnapshot(next);
      atualizarOng(ong);
      setSuccess('Dados atualizados.');
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Erro na requisição');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>ONG / Instituição</h1>
        <p>Atualize os dados da instituição.</p>
      </header>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className={styles.success} role="status">
          {success}
        </p>
      ) : null}

      {loading ? (
        <p className={styles.status} aria-busy="true">
          Carregando…
        </p>
      ) : null}

      {!loading && loaded ? (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <section className={styles.card}>
            <h2>Dados da instituição</h2>
            <div className={styles.fields}>
              <label className={styles.full} htmlFor="nome">
                Nome da ONG
                <input
                  id="nome"
                  name="nome"
                  maxLength={NOME_MAX}
                  autoComplete="organization"
                  value={form.nome}
                  onChange={updateField('nome')}
                  required
                  aria-required="true"
                />
              </label>

              <label className={styles.full} htmlFor="email">
                E-mail
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={updateField('email')}
                  required
                  aria-required="true"
                />
              </label>

              <label htmlFor="cidade">
                Cidade
                <input
                  id="cidade"
                  name="cidade"
                  maxLength={60}
                  autoComplete="address-level2"
                  placeholder="Ex: Lajeado"
                  value={form.cidade}
                  onChange={updateField('cidade')}
                  required
                  aria-required="true"
                />
              </label>

              <label className={styles.uf} htmlFor="uf">
                UF
                <input
                  id="uf"
                  name="uf"
                  maxLength={2}
                  autoComplete="address-level1"
                  placeholder="Ex: RS"
                  value={form.uf}
                  onChange={updateField('uf')}
                  required
                  aria-required="true"
                />
              </label>
            </div>
          </section>

          <div className={styles.footer}>
            <button
              className={styles.cancel}
              type="button"
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button className={styles.submit} type="submit" disabled={submitting}>
              {submitting ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
