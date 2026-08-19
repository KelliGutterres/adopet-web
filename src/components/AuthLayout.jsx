import { Link } from 'react-router-dom';
import { ShieldIcon } from './AuthIcons.jsx';
import PawLogo from './PawLogo.jsx';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ children, variant = 'login' }) {
  const isCadastro = variant === 'cadastro';

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brandPanel}>
          <div>
            <div className={styles.brand}>
              <PawLogo size={30} className={styles.logoIcon} />
              <span>AdoPet</span>
            </div>
            <p className={styles.tagline}>Conectando pets a novos começos 💜</p>
            <p className={styles.heading}>
              Ajude a encontrar, adotar e <em>transformar vidas</em>.
            </p>
            <p className={styles.lead}>
              AdoPet é a plataforma que conecta pessoas, ONGs e animais em busca de um lar ou do
              reencontro com quem ama.
            </p>
          </div>
          <div className={styles.art}>
            <svg className={styles.wave} viewBox="0 0 500 180" preserveAspectRatio="none" aria-hidden="true">
              <path
                fill="currentColor"
                d="M0 92c42-38 86 8 128-10 52-22 78 28 132 18 48-9 74-48 122-28 28 12 64 38 118 8v100H0V92z"
              />
            </svg>
            <img className={styles.pets} src="/login-pets.png" alt="" />
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formHeader}>
            <p className={styles.signupHint}>
              {isCadastro ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            </p>
            <Link className={styles.signup} to={isCadastro ? '/login' : '/cadastro'}>
              {isCadastro ? 'Entrar' : 'Cadastre-se'}
            </Link>
          </div>
          <div className={styles.formMain}>{children}</div>
          <p className={styles.formFooter}>
            <ShieldIcon />
            Seus dados estão protegidos com segurança.
          </p>
        </div>
      </section>
    </main>
  );
}
