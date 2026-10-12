import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthContextType, UsuarioAutenticado, RolUsuario } from '@/types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UsuarioAutenticado;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUsuario(null);
  }, []);

  const login = useCallback((nuevoToken: string, nuevoUsuario: UsuarioAutenticado) => {
    localStorage.setItem(TOKEN_KEY, nuevoToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  }, []);

  // Escuchar evento 401 lanzado por el interceptor HTTP de api-client.ts
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const rol: RolUsuario | null = usuario?.rol ?? null;
  const estaAutenticado = Boolean(token && usuario);

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        estaAutenticado,
        rol,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
