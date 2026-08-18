import styles from './AuthCard.module.css';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.brand}>AdoPet</p>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        {children}
      </section>
    </main>
  );
}
