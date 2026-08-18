import { Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Login</h1>
      <p className={styles.subtitle}>Tela de autenticação da ONG — em breve (spec 002).</p>
      <Link className={styles.link} to="/">
        Voltar
      </Link>
    </main>
  );
}
