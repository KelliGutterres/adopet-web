import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '@/components/AuthCard.jsx';
import PasswordField from '@/components/PasswordField.jsx';
import styles from '@/components/AuthCard.module.css';
import { useAuth } from '@/hooks/useAuth.js';
import { isEmailValid, MIN_SENHA } from '@/services/authService.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!isEmailValid(email)) {
      setError('Informe um e-mail válido');
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
    <AuthCard title="Entrar no painel" subtitle="Área exclusiva para ONGs">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <PasswordField
          id="senha"
          label="Senha"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          autoComplete="current-password"
        />
        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}
        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className={styles.footer}>
        <Link className={styles.link} to="/esqueci-senha">
          Esqueci minha senha
        </Link>
      </p>
    </AuthCard>
  );
}
