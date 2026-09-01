import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cadastrarOng, me as fetchMe, loginOng } from '@/services/authService.js';
import {
  clearSession,
  readStoredOng,
  readStoredToken,
  saveOng,
  saveSession,
} from '@/services/session.js';

const AuthContext = createContext(null);

function ongFromMe(profile, storedOng) {
  if (storedOng && storedOng.email) {
    return storedOng;
  }
  return {
    idInstituicao: profile.id,
    email: profile.email,
    nome: profile.email,
  };
}

export function AuthProvider({ children }) {
  const [ong, setOng] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedToken = readStoredToken();
      if (!storedToken) {
        if (!cancelled) {
          setReady(true);
        }
        return;
      }

      try {
        const profile = await fetchMe();
        if (cancelled) {
          return;
        }
        if (profile.papel !== 'ong') {
          clearSession();
          setToken(null);
          setOng(null);
        } else {
          const nextOng = ongFromMe(profile, readStoredOng());
          setToken(storedToken);
          setOng(nextOng);
        }
      } catch {
        if (!cancelled) {
          clearSession();
          setToken(null);
          setOng(null);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const atualizarOng = useCallback((ongDaApi) => {
    saveOng(ongDaApi);
    setOng(ongDaApi);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setOng(null);
  }, []);

  const value = useMemo(
    () => ({
      ong,
      token,
      ready,
      isAuthenticated: Boolean(token),
      async login({ email, senha }) {
        const result = await loginOng({ email, senha });
        saveSession(result.token, result.ong);
        setToken(result.token);
        setOng(result.ong);
      },
      async cadastrar({ nome, email, senha, cidade }) {
        const result = await cadastrarOng({ nome, email, senha, cidade });
        saveSession(result.token, result.ong);
        setToken(result.token);
        setOng(result.ong);
      },
      logout,
      atualizarOng,
    }),
    [ong, token, ready, logout, atualizarOng],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
