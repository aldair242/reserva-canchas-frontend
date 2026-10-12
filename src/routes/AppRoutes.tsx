import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegistroPage } from '@/features/auth/RegistroPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Rutas protegidas para JUGADOR */}
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute rolesPermitidos={['JUGADOR']}>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h1 className="text-xl font-bold">Mis Reservas (Jugador)</h1>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-partidos"
          element={
            <ProtectedRoute rolesPermitidos={['JUGADOR']}>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h1 className="text-xl font-bold">Mis Partidos (Jugador)</h1>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute rolesPermitidos={['JUGADOR']}>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h1 className="text-xl font-bold">Mi Perfil de Jugador</h1>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas para ADMIN_SEDE y ADMIN */}
        <Route
          path="/admin/sedes"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN_SEDE', 'ADMIN']}>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h1 className="text-xl font-bold">Panel de Sedes</h1>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/canchas"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN_SEDE', 'ADMIN']}>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h1 className="text-xl font-bold">Panel de Canchas</h1>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservas"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN_SEDE', 'ADMIN']}>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h1 className="text-xl font-bold">Reservas de la Sede</h1>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas solo para ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN']}>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <h1 className="text-xl font-bold">Panel de Administración Global</h1>
              </div>
            </ProtectedRoute>
          }
        />

        {/* 404 No encontrado */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
