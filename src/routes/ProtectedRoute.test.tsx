import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirige a /login cuando el usuario no está autenticado', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/privado']}>
          <Routes>
            <Route
              path="/privado"
              element={
                <ProtectedRoute>
                  <div>Contenido Privado</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Pantalla de Login</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Pantalla de Login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Privado')).not.toBeInTheDocument();
  });

  it('redirige a /403 cuando el usuario no tiene el rol permitido', () => {
    localStorage.setItem('auth_token', 'jwt-token-falso');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 1,
        nombre: 'Carlos',
        apellido: 'Perez',
        correo: 'carlos@prueba.com',
        rol: 'JUGADOR',
      })
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/sedes']}>
          <Routes>
            <Route
              path="/admin/sedes"
              element={
                <ProtectedRoute rolesPermitidos={['ADMIN_SEDE', 'ADMIN']}>
                  <div>Gestión de Sedes</div>
                </ProtectedRoute>
              }
            />
            <Route path="/403" element={<div>Acceso Denegado 403</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Acceso Denegado 403')).toBeInTheDocument();
    expect(screen.queryByText('Gestión de Sedes')).not.toBeInTheDocument();
  });

  it('permite el acceso cuando el usuario está autenticado y tiene el rol permitido', () => {
    localStorage.setItem('auth_token', 'jwt-token-falso');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        id: 2,
        nombre: 'Admin',
        apellido: 'General',
        correo: 'admin@prueba.com',
        rol: 'ADMIN',
      })
    );

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/sedes']}>
          <Routes>
            <Route
              path="/admin/sedes"
              element={
                <ProtectedRoute rolesPermitidos={['ADMIN_SEDE', 'ADMIN']}>
                  <div>Gestión de Sedes</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Gestión de Sedes')).toBeInTheDocument();
  });
});
