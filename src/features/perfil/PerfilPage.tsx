import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useObtenerEstadisticas, useListarTodas } from '@/api/endpoints';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Trophy,
  Flame,
  Award,
  Activity,
  Percent,
  Calendar,
  Building2,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';

export const PerfilPage: React.FC = () => {
  const { usuario } = useAuth();
  const [sedeId, setSedeId] = useState<number | undefined>(undefined);
  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');

  const { data: sedes = [] } = useListarTodas();

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useObtenerEstadisticas(
    usuario?.id || 0,
    {
      sedeId,
      desde: desde || undefined,
      hasta: hasta || undefined,
    },
    {
      query: {
        enabled: !!usuario?.id,
      },
    }
  );

  return (
    <div className="space-y-6">
      {/* Tarjeta de Perfil del Jugador */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {usuario?.nombre?.charAt(0)}
            {usuario?.apellido?.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                {usuario?.nombre} {usuario?.apellido}
              </h1>
              {usuario?.apodo && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  "{usuario.apodo}"
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {usuario?.correo}
              </span>
              {usuario?.telefono && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {usuario.telefono}
                </span>
              )}
              {usuario?.posicionPreferida && (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <Shield className="w-3.5 h-3.5" />
                  {usuario.posicionPreferida}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Rol de Cuenta
          </span>
          <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mt-1">
            {usuario?.rol}
          </span>
        </div>
      </div>

      {/* Barra de Filtros Estadísticos */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Filtro Sede */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sedeId || ''}
              onChange={(e) => setSedeId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.distrito})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Fechas */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Desde:</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
            />
            <span>Hasta:</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
            />
          </div>
        </div>

        {(sedeId || desde || hasta) && (
          <button
            type="button"
            onClick={() => {
              setSedeId(undefined);
              setDesde('');
              setHasta('');
            }}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Estados: Carga / Error */}
      {isLoading && <LoadingSpinner mensaje="Calculando estadísticas del jugador..." />}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al calcular las estadísticas del jugador')}
          onReintentar={() => refetch()}
        />
      )}

      {/* Tarjetas Estadísticas */}
      {!isLoading && !isError && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Partidos Jugados */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Partidos
                </span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-extrabold text-slate-800 mt-3">
                {stats.partidosJugados ?? 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-1">Disputados</span>
            </div>

            {/* Goles */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Goles
                </span>
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-3xl font-extrabold text-orange-600 mt-3">
                {stats.goles ?? 0}
              </p>
              <span className="text-[11px] text-slate-500 mt-1">
                Promedio: {(stats.golesPorPartido ?? 0).toFixed(2)} / partido
              </span>
            </div>

            {/* Asistencias */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Asistencias
                </span>
                <Award className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-extrabold text-blue-600 mt-3">
                {stats.asistencias ?? 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-1">Pases de gol</span>
            </div>

            {/* Participaciones en Gol */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">
                  G + A
                </span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-amber-600 mt-3">
                {stats.participacionesEnGol ?? 0}
              </p>
              <span className="text-[11px] text-slate-400 mt-1">
                Contribución directa
              </span>
            </div>
          </div>

          {/* Desglose de Resultados y Efectividad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Registro de Victorias, Empates y Derrotas */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Historial de Resultados</span>
              </h2>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-800">Victorias</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {stats.victorias ?? 0}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-slate-700">Empates</p>
                  <p className="text-2xl font-black text-slate-700 mt-1">
                    {stats.empates ?? 0}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-800">Derrotas</p>
                  <p className="text-2xl font-black text-red-700 mt-1">
                    {stats.derrotas ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Porcentaje de Efectividad */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span>Porcentaje de Victorias</span>
                </h2>
                <span className="text-xl font-extrabold text-emerald-700">
                  {(stats.porcentajeVictorias ?? 0).toFixed(1)}%
                </span>
              </div>

              {/* Barra de progreso visual */}
              <div className="mt-4">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.porcentajeVictorias ?? 0, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Basado en {stats.partidosJugados ?? 0} partidos jugados en la plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
