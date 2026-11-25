import React, { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useObtenerEstadisticas, useListarTodas } from '@/api/endpoints';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/ui/Card';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Award,
  Activity,
  Flame,
  Calendar,
  Building2,
  Mail,
  Phone,
  Shield,
  TrendingUp,
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
    <div className="space-y-6 pb-12">
      {/* Tarjeta de Perfil del Jugador CanchaYa */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-turf-600 to-turf-500 text-white flex items-center justify-center font-black text-3xl shadow-lg border-2 border-turf-400 font-display">
            {usuario?.nombre?.charAt(0) || 'J'}
            {usuario?.apellido?.charAt(0) || ''}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                {usuario?.nombre} {usuario?.apellido}
              </h1>
              {usuario?.apodo && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-turf-500/20 text-turf-300 border border-turf-500/30">
                  "{usuario.apodo}"
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-turf-400" />
                {usuario?.correo}
              </span>
              {usuario?.telefono && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-turf-400" />
                  {usuario.telefono}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-turf-400" />
                Rol: <strong className="text-white">{usuario?.rol || 'JUGADOR'}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="z-10 flex sm:flex-col items-center gap-2">
          <span className="text-xs font-bold text-turf-400 bg-turf-950/80 px-3 py-1 rounded-full border border-turf-800">
            Ficha Oficial CanchaYa
          </span>
        </div>

        {/* Círculo decorativo */}
        <div className="absolute right-0 -bottom-16 w-64 h-64 bg-turf-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Barra de Filtro para Estadísticas */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sedeId ?? ''}
              onChange={(e) =>
                setSedeId(e.target.value ? Number(e.target.value) : undefined)
              }
              aria-label="Filtrar estadísticas por sede"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-turf-500"
            >
              <option value="">Todas las sedes deportivas</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} - {s.distrito}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Desde:</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              aria-label="Fecha inicio para filtro de estadísticas"
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
            />
            <span>Hasta:</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              aria-label="Fecha fin para filtro de estadísticas"
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
            />
          </div>

          {(sedeId || desde || hasta) && (
            <button
              type="button"
              onClick={() => {
                setSedeId(undefined);
                setDesde('');
                setHasta('');
              }}
              className="text-xs text-turf-700 hover:text-turf-800 font-bold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </Card>

      {/* Estados de Carga y Error */}
      {isLoading && <LoadingSpinner mensaje="Calculando estadísticas deportivas..." />}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al consultar las estadísticas del jugador')}
          onReintentar={() => refetch()}
        />
      )}

      {/* Estadísticas Detalladas */}
      {!isLoading && !isError && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Partidos Jugados */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-navy-50 text-navy-700 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Partidos
                </span>
                <span className="text-2xl font-black text-navy-950 font-display">
                  {stats.partidosJugados ?? 0}
                </span>
              </div>
            </div>

            {/* Goles */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Goles
                </span>
                <span className="text-2xl font-black text-navy-950 font-display">
                  {stats.goles ?? 0}
                </span>
              </div>
            </div>

            {/* Asistencias */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Asistencias
                </span>
                <span className="text-2xl font-black text-navy-950 font-display">
                  {stats.asistencias ?? 0}
                </span>
              </div>
            </div>

            {/* Promedio Goles */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-turf-50 text-turf-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Goles / Partido
                </span>
                <span className="text-2xl font-black text-navy-950 font-display">
                  {Number(stats.golesPorPartido || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Grilla Secundaria: Victorias, Empates, Derrotas y Porcentaje */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-emerald-700 block">Victorias</span>
              <span className="text-xl font-black text-slate-800 font-display mt-1 block">
                {stats.victorias ?? 0}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-amber-700 block">Empates</span>
              <span className="text-xl font-black text-slate-800 font-display mt-1 block">
                {stats.empates ?? 0}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-red-700 block">Derrotas</span>
              <span className="text-xl font-black text-slate-800 font-display mt-1 block">
                {stats.derrotas ?? 0}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-xs font-bold text-turf-700 block">Efectividad</span>
              <span className="text-xl font-black text-slate-800 font-display mt-1 block">
                {Number(stats.porcentajeVictorias || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
