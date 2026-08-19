import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout.jsx';
import PasswordField from '@/components/PasswordField.jsx';
import TextField from '@/components/TextField.jsx';
import { MailIcon } from '@/components/AuthIcons.jsx';
import styles from '@/components/AuthForm.module.css';
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
    <AuthLayout>
      <h1 className={styles.title}>Redefinir senha</h1>
      <p className={styles.subtitle}>Informe o e-mail da ONG e a nova senha</p>
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
    </AuthLayout>
  );
}
