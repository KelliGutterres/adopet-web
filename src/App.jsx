import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import PublicOnlyRoute from '@/components/PublicOnlyRoute.jsx';
import { useAuth } from '@/hooks/useAuth.js';
import PainelLayout from '@/layouts/PainelLayout.jsx';
import AnimalFormPage from '@/pages/AnimalFormPage.jsx';
import AnimaisListPage from '@/pages/AnimaisListPage.jsx';
import OngProfilePage from '@/pages/OngProfilePage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';
import RegisterPage from '@/pages/RegisterPage.jsx';
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
        <Route
          path="/cadastro"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/esqueci-senha"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/painel"
          element={
            <ProtectedRoute>
              <PainelLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="animais/adocao" replace />} />
          <Route path="ong" element={<OngProfilePage />} />
          <Route path="animais/novo" element={<AnimalFormPage />} />
          <Route path="animais/:idAnimal/editar" element={<AnimalFormPage />} />
          <Route path="animais/:situacao" element={<AnimaisListPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BootGate>
  );
}
