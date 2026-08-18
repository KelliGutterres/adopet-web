import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import styles from './PainelPage.module.css';

export default function PainelPage() {
  const { ong, logout } = useAuth();
  const navigate = useNavigate();
  const nome = ong?.nome || ong?.email || 'ONG';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.brand}>AdoPet</p>
        <h1 className={styles.title}>Olá, {nome}</h1>
        <p className={styles.subtitle}>Painel da ONG — gerenciamento de animais em breve.</p>
        <button className={styles.logout} type="button" onClick={handleLogout}>
          Sair
        </button>
      </section>
    </main>
  );
}
