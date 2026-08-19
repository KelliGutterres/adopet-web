import styles from './PainelHeader.module.css';

function iniciaisOng(nome) {
  const parts = (nome || 'ONG').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'ONG';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 3).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function PainelHeader({ ongNome, onMenuClick }) {
  const nome = ongNome || 'ONG';

  return (
    <header className={styles.header}>
      <button
        className={styles.menu}
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div className={styles.profile}>
        <span className={styles.avatar} aria-hidden="true">
          {iniciaisOng(nome)}
        </span>
        <span className={styles.meta}>
          <strong>{nome}</strong>
          <small>ONG</small>
        </span>
      </div>
    </header>
  );
}
