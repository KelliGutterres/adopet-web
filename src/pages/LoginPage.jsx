import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout.jsx';
import PasswordField from '@/components/PasswordField.jsx';
import TextField from '@/components/TextField.jsx';
import { LogInIcon, MailIcon } from '@/components/AuthIcons.jsx';
import styles from '@/components/AuthForm.module.css';
import { useAuth } from '@/hooks/useAuth.js';
import { isEmailValid, MIN_SENHA } from '@/services/authService.js';

function initialEmail(location, searchParams) {
  const fromState = typeof location.state?.email === 'string' ? location.state.email.trim() : '';
  if (fromState) return fromState;
  return String(searchParams.get('email') || '').trim();
}

function forgotPasswordPath(email) {
  const trimmed = email.trim();
  return trimmed ? `/esqueci-senha?email=${encodeURIComponent(trimmed)}` : '/esqueci-senha';
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => initialEmail(location, searchParams));
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [info] = useState(() => (
    location.state?.senhaAtualizada ? 'Senha atualizada. Faça login com a nova senha.' : ''
  ));
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!isEmailValid(email)) {
      setError('Informe um e-mail válido!');
      return;
    }
    if (!senha || senha.length < MIN_SENHA) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), senha });
      navigate('/painel', { replace: true });
    } catch (err) {
      setError(err.message || 'Erro na requisição');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className={styles.title}>Bem-vindo de volta!</h1>
      <p className={styles.subtitle}>Faça login para acessar sua conta</p>
      {info && !error ? (
        <p className={styles.success} role="status">
          {info}
        </p>
      ) : null}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
        <PasswordField
          id="senha"
          label="Senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="current-password"
        />
        <p className={styles.forgotRow}>
          <Link className={styles.link} to={forgotPasswordPath(email)}>
            Esqueceu sua senha?
          </Link>
        </p>
        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}
        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : (
            <>
              Entrar
              <LogInIcon />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
