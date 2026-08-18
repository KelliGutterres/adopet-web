import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '@/components/AuthCard.jsx';
import PasswordField from '@/components/PasswordField.jsx';
import styles from '@/components/AuthCard.module.css';
import { isEmailValid, MIN_SENHA, redefinirSenhaOng } from '@/services/authService.js';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!isEmailValid(email)) {
      setError('Informe um e-mail válido');
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
      await redefinirSenhaOng({ email: email.trim(), senha });
      setSuccess(true);
      setSenha('');
      setConfirmacao('');
    } catch (err) {
      setError(err.message || 'Erro na requisição');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Redefinir senha">
      {success ? (
        <>
          <p className={styles.success} role="status">
            Senha atualizada. Faça login com a nova senha.
          </p>
          <p className={styles.footer}>
            <Link className={styles.link} to="/login">
              Voltar ao login
            </Link>
          </p>
        </>
      ) : (
        <>
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
              label="Nova senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              autoComplete="new-password"
              placeholder="Nova senha"
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
              {submitting ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
          <p className={styles.footer}>
            <Link className={styles.link} to="/login">
              Voltar ao login
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}
