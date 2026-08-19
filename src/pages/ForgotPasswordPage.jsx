import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '@/components/AuthLayout.jsx';
import PasswordField from '@/components/PasswordField.jsx';
import TextField from '@/components/TextField.jsx';
import { LockIcon, MailIcon } from '@/components/AuthIcons.jsx';
import styles from '@/components/AuthForm.module.css';
import { isEmailValid, MIN_SENHA, redefinirSenhaOng } from '@/services/authService.js';

function loginPath(email) {
  const trimmed = email.trim();
  return trimmed ? `/login?email=${encodeURIComponent(trimmed)}` : '/login';
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(() => String(searchParams.get('email') || '').trim());
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const emailTrim = email.trim();

    if (!isEmailValid(emailTrim)) {
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
      await redefinirSenhaOng({ email: emailTrim, senha });
      navigate('/login', {
        replace: true,
        state: { senhaAtualizada: true, email: emailTrim },
      });
    } catch (err) {
      setError(err.message || 'Erro na requisição');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className={styles.title}>Esqueceu a senha?</h1>
      <p className={styles.subtitle}>Informe o e-mail da ONG e escolha uma nova senha</p>
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
          placeholder="Digite a nova senha"
        />
        <PasswordField
          id="confirmacao"
          label="Confirmar senha"
          value={confirmacao}
          onChange={(event) => setConfirmacao(event.target.value)}
          autoComplete="new-password"
          placeholder="Confirme a nova senha"
        />
        {error ? (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        ) : null}
        <button className={styles.submit} type="submit" disabled={submitting}>
          {submitting ? 'Redefinindo…' : (
            <>
              Redefinir senha
              <LockIcon />
            </>
          )}
        </button>
      </form>
      <p className={styles.footer}>
        <Link className={styles.link} to={loginPath(email)}>
          Voltar ao login
        </Link>
      </p>
    </AuthLayout>
  );
}
