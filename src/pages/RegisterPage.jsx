import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout.jsx';
import PasswordField from '@/components/PasswordField.jsx';
import TextField from '@/components/TextField.jsx';
import { BuildingIcon, MailIcon, MapPinIcon, UserPlusIcon } from '@/components/AuthIcons.jsx';
import styles from '@/components/AuthForm.module.css';
import { useAuth } from '@/hooks/useAuth.js';
import { isEmailValid, isUfValid, MIN_SENHA } from '@/services/authService.js';

export default function RegisterPage() {
  const { cadastrar } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const nomeTrim = nome.trim();
    const cidadeTrim = cidade.trim();
    const ufNorm = uf.trim().toUpperCase();

    if (!nomeTrim) {
      setError('Informe o nome da ONG');
      return;
    }
    if (!isEmailValid(email)) {
      setError('Informe um e-mail válido');
      return;
    }
    if (!cidadeTrim) {
      setError('Informe a cidade');
      return;
    }
    if (!isUfValid(ufNorm)) {
      setError('Informe a UF (2 letras, ex.: RS)');
      return;
    }
    if (!senha || senha.length < MIN_SENHA) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (senha !== confirmacao) {
      setError('As senhas não coincidem');
      return;
    }

    setSubmitting(true);
    try {
      await cadastrar({
        nome: nomeTrim,
        email: email.trim(),
        senha,
        cidade: { nome: cidadeTrim, uf: ufNorm },
      });
      navigate('/painel', { replace: true });
    } catch (err) {
      setError(err.message || 'Erro na requisição');
    } finally {
      setSubmitting(false);
    }
  }

  function handleUfChange(event) {
    const next = event.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    setUf(next);
  }

  return (
    <AuthLayout variant="cadastro">
      <h1 className={`${styles.title} ${styles.titleCompact}`}>Crie a conta da ONG</h1>
      <p className={`${styles.subtitle} ${styles.subtitleCompact}`}>
        Preencha os dados da instituição para acessar o painel
      </p>
      <form className={`${styles.form} ${styles.compact}`} onSubmit={handleSubmit} noValidate>
        <TextField
          id="nome"
          label="Nome da ONG"
          name="organization"
          autoComplete="organization"
          placeholder="Digite o nome da instituição"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          icon={<BuildingIcon />}
          maxLength={100}
        />
        <TextField
          id="email"
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<MailIcon />}
        />
        <div className={styles.row}>
          <TextField
            id="cidade"
            label="Cidade"
            name="city"
            autoComplete="address-level2"
            placeholder="Ex.: Lajeado"
            value={cidade}
            onChange={(event) => setCidade(event.target.value)}
            icon={<MapPinIcon />}
            maxLength={60}
          />
          <TextField
            id="uf"
            label="UF"
            name="state"
            autoComplete="address-level1"
            placeholder="Ex.: RS"
            value={uf}
            onChange={handleUfChange}
            maxLength={2}
            className={styles.ufField}
          />
        </div>
        <PasswordField
          id="senha"
          label="Senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="new-password"
          placeholder="Crie uma senha"
        />
        <PasswordField
          id="confirmacao"
          label="Confirmar senha"
          value={confirmacao}
          onChange={(event) => setConfirmacao(event.target.value)}
          autoComplete="new-password"
          placeholder="Confirmar senha"
        />
        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}
        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Cadastrando…' : (
            <>
              Cadastrar
              <UserPlusIcon />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
