import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import PainelHeader from '@/components/PainelHeader.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import styles from './PainelLayout.module.css';

export default function PainelLayout() {
  const { ong } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen ? (
        <button
          className={styles.backdrop}
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <div className={styles.main}>
        <PainelHeader ongNome={ong?.nome} onMenuClick={() => setMenuOpen(true)} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
