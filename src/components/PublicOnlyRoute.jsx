import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth.js';

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/painel" replace />;
  }

  return children;
}
