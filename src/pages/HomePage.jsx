import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>AdoPet — painel da ONG</h1>
      <p className={styles.subtitle}>Área administrativa do sistema.</p>
      <Link className={styles.link} to="/login">
        Ir para o login
      </Link>
    </main>
  );
}
