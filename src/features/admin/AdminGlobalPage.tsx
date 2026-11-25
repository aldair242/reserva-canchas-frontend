import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useListarTodas, useListarTodas1 } from '@/api/endpoints';
import { useListarAdministradoresSede } from './adminUsuariosApi';
import {
  Shield,
  Building2,
  Grid,
  Calendar,
  ArrowRight,
  UserCheck,
  Users,
} from 'lucide-react';

export const AdminGlobalPage: React.FC = () => {
  const { usuario } = useAuth();

  const { data: sedes = [] } = useListarTodas();
  const { data: canchas = [] } = useListarTodas1();
  const { data: administradores = [] } = useListarAdministradoresSede();

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-700/60 text-purple-200 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Panel de Control - Administrador General</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Bienvenido, {usuario?.nombre} {usuario?.apellido}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-purple-200 max-w-2xl">
          Supervisión global de la plataforma: gestión integral de sedes, canchas reglamentarias, políticas tarifarias y reservas en tiempo real.
        </p>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sedes Registradas
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {sedes.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Canchas Activas
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {canchas.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Grid className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Admins de Sede
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {administradores.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tu Perfil
            </p>
            <p className="text-sm font-bold text-purple-700 mt-1">
              ADMIN GLOBAL
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Módulos de Administración */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Módulo Sedes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Gestión de Sedes
            </h2>
            <p className="text-xs text-slate-600">
              Crea nuevos complejos deportivos, asigna administradores locales, actualiza horarios y consulta ubicaciones.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/admin/sedes"
              className="inline-flex items-center justify-between w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <span>Ir a Gestión de Sedes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Módulo Canchas */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Grid className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Canchas & Tarifas
            </h2>
            <p className="text-xs text-slate-600">
              Configura canchas por deporte (Fútbol, Básquet, Vóley, Pádel), superficies y tarifas estándar u hora pico.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/admin/canchas"
              className="inline-flex items-center justify-between w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <span>Ir a Canchas & Tarifas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Módulo Administradores de Sede */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Admins de Sede
            </h2>
            <p className="text-xs text-slate-600">
              Registra nuevos administradores de sede, administra sus credenciales y supervisa sus complejos deportivos.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/admin/usuarios"
              className="inline-flex items-center justify-between w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <span>Gestionar Admins Sede</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Módulo Reservas */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Control de Reservas
            </h2>
            <p className="text-xs text-slate-600">
              Monitorea el calendario diario de turnos confirmados, cancelados y pendientes en cualquiera de las sedes.
            </p>
          </div>
          <div className="pt-6">
            <Link
              to="/admin/reservas"
              className="inline-flex items-center justify-between w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <span>Ver Calendario de Reservas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

