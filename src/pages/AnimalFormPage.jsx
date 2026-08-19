import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { isUfValid } from '@/services/authService.js';
import {
  atualizarAnimal,
  buscarAnimalPorId,
  criarAnimal,
} from '@/services/animaisService.js';
import {
  FORM_COPY,
  normalizeStatus,
  pathFromStatus,
} from './animaisListConfig.js';
import styles from './AnimalFormPage.module.css';

const IDADE_MAX = 20;

function emptyForm(ong) {
  return {
    nome: '',
    especie: '',
    raca: '',
    idade: '',
    porte: '',
    descricao: '',
    cidade: ong?.cidade?.nome || '',
    uf: ong?.cidade?.uf || '',
  };
}

function formFromAnimal(animal) {
  return {
    nome: animal.nome || '',
    especie: animal.especie || '',
    raca: animal.raca?.nome || '',
    idade: animal.idade === null || animal.idade === undefined ? '' : String(animal.idade),
    porte: animal.porte || '',
    descricao: animal.descricao || '',
    cidade: animal.cidade?.nome || '',
    uf: animal.cidade?.uf || '',
  };
}

function validate(form) {
  if (!form.nome.trim()) {
    return 'Informe o nome';
  }
  if (!form.especie) {
    return 'Selecione a espécie';
  }
  if (!form.raca.trim()) {
    return 'Informe a raça';
  }
  if (!form.porte) {
    return 'Selecione o porte';
  }
  if (form.idade !== '') {
    const idade = Number(form.idade);
    if (!Number.isInteger(idade) || idade < 0) {
      return 'Informe a idade em anos (0 ou mais)';
    }
  }
  if (!form.cidade.trim()) {
    return 'Informe a cidade';
  }
  if (!isUfValid(form.uf)) {
    return 'Informe a UF (2 letras, ex.: RS)';
  }
  if (!form.descricao.trim()) {
    return 'Informe a descrição';
  }
  if (form.descricao.trim().length > 200) {
    return 'A descrição deve ter no máximo 200 caracteres';
  }
  return '';
}

function buildBody(form, { status } = {}) {
  const body = {
    nome: form.nome.trim(),
    descricao: form.descricao.trim(),
    especie: form.especie,
    porte: form.porte,
    cidade: {
      nome: form.cidade.trim(),
      uf: form.uf.trim().toUpperCase(),
    },
    raca: { nome: form.raca.trim() },
  };

  if (status) {
    body.status = status;
  }

  if (form.idade !== '') {
    body.idade = Number(form.idade);
  }

  return body;
}

export default function AnimalFormPage() {
  const { idAnimal } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { ong, logout } = useAuth();
  const isEdit = Boolean(idAnimal);

  const status = normalizeStatus(searchParams.get('status'));
  const copy = isEdit
    ? { title: 'Editar animal', subtitle: '' }
    : FORM_COPY[status];

  const [form, setForm] = useState(() => emptyForm(ong));
  const [animalNome, setAnimalNome] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [loaded, setLoaded] = useState(!isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const idadeOptions = useMemo(
    () => Array.from({ length: IDADE_MAX + 1 }, (_, idade) => idade),
    [],
  );

  useEffect(() => {
    if (!isEdit) {
      return undefined;
    }

    const id = Number(idAnimal);
    if (!Number.isInteger(id) || id <= 0) {
      setError('Animal não encontrado');
      setLoading(false);
      setLoaded(false);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const animal = await buscarAnimalPorId(id);
        if (cancelled) {
          return;
        }
        if (!animal) {
          setError('Animal não encontrado');
          setLoaded(false);
          return;
        }
        setForm(formFromAnimal(animal));
        setAnimalNome(animal.nome || '');
        setLoaded(true);
        const nextStatus = normalizeStatus(animal.status);
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
  }, [idAnimal, isEdit, logout, navigate, setSearchParams]);

  function updateField(field) {
    return (event) => {
      let value = event.target.value;
      if (field === 'uf') {
        value = value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
      }
      setForm((current) => ({ ...current, [field]: value }));
    };
  }

  function goBack() {
    navigate(pathFromStatus(status));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const localError = validate(form);
    if (localError) {
      setError(localError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (isEdit) {
        await atualizarAnimal(idAnimal, buildBody(form));
      } else {
        await criarAnimal(buildBody(form, { status }));
      }
      navigate(pathFromStatus(status), { replace: true });
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

  const subtitle = isEdit
    ? `Atualize os dados de ${animalNome || 'animal'}.`
    : copy.subtitle;

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>{isEdit ? 'Editar animal' : copy.title}</h1>
        <p>{subtitle}</p>
      </header>

      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className={styles.status} aria-busy="true">
          Carregando animal…
        </p>
      ) : null}

      {!loading && isEdit && !loaded ? (
        <button className={styles.cancel} type="button" onClick={goBack}>
          Cancelar
        </button>
      ) : null}

      {!loading && loaded ? (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.grid}>
            <section className={styles.card}>
              <h2>Informações básicas</h2>
              <div className={styles.fields}>
                <label className={styles.full} htmlFor="nome">
                  Nome do animal <span aria-hidden="true">*</span>
                  <input
                    id="nome"
                    name="nome"
                    maxLength={80}
                    placeholder="Ex: Thor"
                    value={form.nome}
                    onChange={updateField('nome')}
                    required
                    aria-required="true"
                  />
                </label>

                <label htmlFor="especie">
                  Espécie <span aria-hidden="true">*</span>
                  <select
                    id="especie"
                    name="especie"
                    value={form.especie}
                    onChange={updateField('especie')}
                    required
                    aria-required="true"
                  >
                    <option value="">Selecione</option>
                    <option value="CAO">Cão</option>
                    <option value="GATO">Gato</option>
                  </select>
                </label>

                <label htmlFor="raca">
                  Raça <span aria-hidden="true">*</span>
                  <input
                    id="raca"
                    name="raca"
                    maxLength={60}
                    placeholder="Ex: SRD, Labrador"
                    value={form.raca}
                    onChange={updateField('raca')}
                    required
                    aria-required="true"
                  />
                </label>

                <label htmlFor="idade">
                  Idade
                  <select id="idade" name="idade" value={form.idade} onChange={updateField('idade')}>
                    <option value="">Selecione</option>
                    {idadeOptions.map((idade) => (
                      <option key={idade} value={idade}>
                        {idade === 1 ? '1 ano' : `${idade} anos`}
                      </option>
                    ))}
                  </select>
                </label>

                <label htmlFor="porte">
                  Porte <span aria-hidden="true">*</span>
                  <select
                    id="porte"
                    name="porte"
                    value={form.porte}
                    onChange={updateField('porte')}
                    required
                    aria-required="true"
                  >
                    <option value="">Selecione</option>
                    <option value="P">Pequeno</option>
                    <option value="M">Médio</option>
                    <option value="G">Grande</option>
                  </select>
                </label>

                <label className={styles.full} htmlFor="descricao">
                  Descrição <span aria-hidden="true">*</span>
                  <textarea
                    id="descricao"
                    name="descricao"
                    maxLength={200}
                    rows={5}
                    placeholder="Descreva o temperamento, hábitos e outras informações importantes…"
                    value={form.descricao}
                    onChange={updateField('descricao')}
                    required
                    aria-required="true"
                  />
                  <small>{form.descricao.length}/200</small>
                </label>
              </div>
            </section>

            <section className={styles.card}>
              <h2>Localização</h2>
              <div className={styles.fields}>
                <label htmlFor="cidade">
                  Cidade <span aria-hidden="true">*</span>
                  <input
                    id="cidade"
                    name="cidade"
                    maxLength={60}
                    placeholder="Ex: Lajeado"
                    value={form.cidade}
                    onChange={updateField('cidade')}
                    required
                    aria-required="true"
                  />
                </label>
                <label htmlFor="uf">
                  UF <span aria-hidden="true">*</span>
                  <input
                    id="uf"
                    name="uf"
                    maxLength={2}
                    placeholder="Ex: RS"
                    value={form.uf}
                    onChange={updateField('uf')}
                    required
                    aria-required="true"
                    autoComplete="address-level1"
                  />
                </label>
              </div>
            </section>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancel} type="button" onClick={goBack} disabled={submitting}>
              Cancelar
            </button>
            <button className={styles.submit} type="submit" disabled={submitting}>
              {submitting ? 'Salvando…' : 'Salvar animal'}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
