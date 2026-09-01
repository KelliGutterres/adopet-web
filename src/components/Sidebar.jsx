import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';
import { listItemIdFromLocation } from '@/pages/animaisListConfig.js';
import PawLogo from './PawLogo.jsx';
import styles from './Sidebar.module.css';

const HOME = '/painel/animais/adocao';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', disabled: true },
  { id: 'adocao', label: 'Animais para Adoção', to: '/painel/animais/adocao' },
  { id: 'encontrados', label: 'Animais Encontrados', to: '/painel/animais/encontrados' },
  { id: 'perdidos', label: 'Animais Perdidos', to: '/painel/animais/perdidos' },
  { id: 'usuarios', label: 'Usuários', disabled: true },
  { id: 'ong', label: 'ONG / Instituição', to: '/painel/ong' },
  { id: 'relatorios', label: 'Relatórios', disabled: true },
  { id: 'config', label: 'Configurações', disabled: true },
];

function Icon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case 'adocao':
      return (
        <svg {...common}>
          <path d="M12 21c-4-3.2-7-6.2-7-9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7 3.5C19 14.8 16 17.8 12 21z" />
        </svg>
      );
    case 'encontrados':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      );
    case 'perdidos':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      );
    case 'usuarios':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" />
          <circle cx="17" cy="9" r="2.2" />
          <path d="M20.5 19c0-2-1.3-3.6-3.2-4.3" />
        </svg>
      );
    case 'ong':
      return (
        <svg {...common}>
          <path d="M4 20V9l8-5 8 5v11" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case 'relatorios':
      return (
        <svg {...common}>
          <path d="M4 19V9" />
          <path d="M10 19V5" />
          <path d="M16 19v-7" />
          <path d="M22 19v-4" />
        </svg>
      );
    case 'config':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case 'sair':
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H4" />
          <path d="M20 4v16" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ open, onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeId = listItemIdFromLocation(location.pathname, location.search);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      <NavLink className={styles.brand} to={HOME} onClick={onNavigate}>
        <PawLogo className={styles.logoIcon} />
        <span>AdoPet</span>
      </NavLink>

      <nav className={styles.nav} aria-label="Menu do painel">
        {NAV_ITEMS.map((item) =>
          item.disabled ? (
            <span
              key={item.id}
              className={`${styles.item} ${styles.disabled}`}
              title="Em breve"
              aria-disabled="true"
            >
              <Icon name={item.id} />
              {item.label}
            </span>
          ) : (
            <NavLink
              key={item.id}
              to={item.to}
              end
              className={`${styles.item} ${activeId === item.id ? styles.active : ''}`}
              aria-current={activeId === item.id ? 'page' : undefined}
              onClick={onNavigate}
            >
              <Icon name={item.id} />
              {item.label}
            </NavLink>
          ),
        )}
      </nav>

      <button className={styles.logout} type="button" onClick={handleLogout}>
        <Icon name="sair" />
        Sair
      </button>
    </aside>
  );
}
