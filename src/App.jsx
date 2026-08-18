import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import PublicOnlyRoute from '@/components/PublicOnlyRoute.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import PainelPage from '@/pages/PainelPage.jsx';
import styles from './App.module.css';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/painel' : '/login'} replace />;
}

function BootGate({ children }) {
  const { ready } = useAuth();
  if (!ready) {
    return (
      <main className={styles.loading}>
        <p>Carregando…</p>
      </main>
    );
  }
  return children;
}

export default function App() {
  return (
    <BootGate>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
        <Route
          path="/painel"
          element={
            <ProtectedRoute>
              <PainelPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BootGate>
  );
}
