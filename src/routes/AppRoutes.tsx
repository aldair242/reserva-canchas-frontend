import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegistroPage } from '@/features/auth/RegistroPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { SedesPage } from '@/features/sedes/SedesPage';
import { CanchasPage } from '@/features/canchas/CanchasPage';
import { CanchaDetallePage } from '@/features/canchas/CanchaDetallePage';
import { MisReservasPage } from '@/features/reservas/MisReservasPage';
import { RankingsPage } from '@/features/rankings/RankingsPage';
import { PerfilPage } from '@/features/perfil/PerfilPage';
import { AdminSedesPage } from '@/features/sedes/AdminSedesPage';
import { AdminCanchasPage } from '@/features/canchas/AdminCanchasPage';
import { AdminReservasPage } from '@/features/reservas/AdminReservasPage';
import { AdminGlobalPage } from '@/features/admin/AdminGlobalPage';
import { AdminUsuariosPage } from '@/features/admin/AdminUsuariosPage';
import { MisPartidosPage } from '@/features/partidos/MisPartidosPage';
import { InvitacionDetallePage } from '@/features/partidos/InvitacionDetallePage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/sedes" element={<SedesPage />} />
        <Route path="/canchas" element={<CanchasPage />} />
        <Route path="/canchas/:id" element={<CanchaDetallePage />} />
        <Route path="/invitaciones/:token" element={<InvitacionDetallePage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Rutas para usuarios autenticados */}
        <Route
          path="/rankings"
          element={
            <ProtectedRoute>
              <RankingsPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas para JUGADOR */}
        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute rolesPermitidos={['JUGADOR']}>
              <MisReservasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-partidos"
          element={
            <ProtectedRoute rolesPermitidos={['JUGADOR']}>
              <MisPartidosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partidos/:id"
          element={
            <ProtectedRoute rolesPermitidos={['JUGADOR']}>
              <MisPartidosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute rolesPermitidos={['JUGADOR']}>
              <PerfilPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas para ADMIN_SEDE y ADMIN */}
        <Route
          path="/admin/sedes"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN_SEDE', 'ADMIN']}>
              <AdminSedesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/canchas"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN_SEDE', 'ADMIN']}>
              <AdminCanchasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reservas"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN_SEDE', 'ADMIN']}>
              <AdminReservasPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas solo para ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN']}>
              <AdminGlobalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute rolesPermitidos={['ADMIN']}>
              <AdminUsuariosPage />
            </ProtectedRoute>
          }
        />

        {/* 404 No encontrado */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
