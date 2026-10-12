import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import type { RolUsuario } from '@/types/auth';

interface ProtectedRouteProps {
  rolesPermitidos?: RolUsuario[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  rolesPermitidos,
  children,
}) => {
  const { estaAutenticado, rol } = useAuth();
  const location = useLocation();

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (rolesPermitidos && rol && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
