import React, { useState } from 'react';
import { useRanking, useListarTodas } from '@/api/endpoints';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { Card } from '@/components/ui/Card';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Trophy,
  Medal,
  Flame,
  Award,
  Building2,
  Calendar,
  User,
  Crown,
  Sparkles,
} from 'lucide-react';

type CriterioRanking = 'GOLES' | 'ASISTENCIAS' | 'VICTORIAS';

export const RankingsPage: React.FC = () => {
  const [criterio, setCriterio] = useState<CriterioRanking>('GOLES');
  const [sedeId, setSedeId] = useState<number | undefined>(undefined);
  const [desde, setDesde] = useState<string>('');
  const [hasta, setHasta] = useState<string>('');

  const { data: sedes = [] } = useListarTodas();

  const {
    data: ranking = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useRanking({
    criterio,
    sedeId,
    desde: desde || undefined,
    hasta: hasta || undefined,
  });

  const getCriterioMeta = (crit: CriterioRanking) => {
    switch (crit) {
      case 'GOLES':
        return {
          titulo: 'Tabla de Goleadores',
          descripcion: 'Los máximos anotadores del torneo y partidos disputados.',
          icono: Flame,
          etiquetaMetrica: 'Goles',
          colorBadge: 'bg-turf-50 text-turf-800 border-turf-200',
        };
      case 'ASISTENCIAS':
        return {
          titulo: 'Líderes en Asistencias',
          descripcion: 'Los mejores generadores de juego y pases de gol.',
          icono: Award,
          etiquetaMetrica: 'Asistencias',
          colorBadge: 'bg-blue-50 text-blue-800 border-blue-200',
        };
      case 'VICTORIAS':
        return {
          titulo: 'Mayor Cantidad de Victorias',
          descripcion: 'Jugadores con más partidos ganados en la plataforma.',
          icono: Trophy,
          etiquetaMetrica: 'Victorias',
          colorBadge: 'bg-amber-50 text-amber-800 border-amber-200',
        };
    }
  };

  const meta = getCriterioMeta(criterio);

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado Principal CanchaYa */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-navy-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turf-500/20 text-turf-400 text-xs font-bold border border-turf-500/30 mb-3">
          <Trophy className="w-3.5 h-3.5" />
          Clasificaciones Oficiales CanchaYa
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
          Rankings y Líderes Deportivos
        </h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl">
          Sigue a los mejores talentos de la comunidad. Estadísticas actualizadas con cada partido registrado en nuestras sedes.
        </p>
      </div>

      {/* Selector de Criterio */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'GOLES', label: 'Goleadores', icono: Flame },
            { id: 'ASISTENCIAS', label: 'Asistidores', icono: Award },
            { id: 'VICTORIAS', label: 'Victorias', icono: Trophy },
          ] as const
        ).map((item) => {
          const activa = criterio === item.id;
          const Icon = item.icono;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCriterio(item.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm ${
                activa
                  ? 'bg-turf-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filtros de Sede y Fechas */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filtro Sede */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sedeId ?? ''}
              onChange={(e) =>
                setSedeId(e.target.value ? Number(e.target.value) : undefined)
              }
              aria-label="Filtrar por sede deportiva"
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

          {/* Filtro Fechas */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Desde:</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              aria-label="Fecha inicio para filtro de ranking"
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
            />
            <span>Hasta:</span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              aria-label="Fecha fin para filtro de ranking"
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

      {/* Estados de carga / error */}
      {isLoading && <LoadingSpinner mensaje="Calculando posiciones del ranking..." />}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al consultar la tabla de clasificación')}
          onReintentar={() => refetch()}
        />
      )}

      {/* Sin registros */}
      {!isLoading && !isError && ranking.length === 0 && (
        <EmptyState
          titulo="Aún no hay datos para esta clasificación"
          descripcion="Los rankings se actualizarán automáticamente a medida que se completen partidos y se registren goles y resultados en las canchas."
          icono={<Trophy className="w-8 h-8 text-slate-400" />}
        />
      )}

      {/* Podio y Tabla de Clasificación */}
      {!isLoading && !isError && ranking.length > 0 && (
        <div className="space-y-8">
          {/* Podio Top 3 Deportivo (Sin emojis) */}
          {ranking.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 pt-6 max-w-2xl mx-auto items-end">
              {/* #2 Plata */}
              <div className="bg-white rounded-2xl p-4 border border-slate-300 shadow-sm text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-black text-slate-700 text-xs mb-2">
                  2°
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Plata
                </div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  {ranking[1]?.jugadorNombre}
                </p>
                <p className="text-xl font-black text-slate-700 mt-1 font-display">
                  {ranking[1]?.valor}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {meta.etiquetaMetrica}
                </p>
              </div>

              {/* #1 Oro */}
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-5 border-2 border-amber-400 shadow-md text-center flex flex-col items-center relative -top-4">
                <div className="w-12 h-12 rounded-full bg-amber-400 text-navy-950 flex items-center justify-center font-black text-sm mb-2 shadow-sm">
                  <Crown className="w-6 h-6 text-navy-950" />
                </div>
                <div className="text-[11px] font-black text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Campeón</span>
                </div>
                <p className="font-extrabold text-sm sm:text-base text-slate-900 line-clamp-1">
                  {ranking[0]?.jugadorNombre}
                </p>
                <p className="text-2xl font-black text-amber-600 mt-1 font-display">
                  {ranking[0]?.valor}
                </p>
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                  {meta.etiquetaMetrica}
                </p>
              </div>

              {/* #3 Bronce */}
              <div className="bg-white rounded-2xl p-4 border border-amber-200/60 shadow-sm text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-600/40 flex items-center justify-center font-black text-amber-900 text-xs mb-2">
                  3°
                </div>
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Bronce
                </div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  {ranking[2]?.jugadorNombre}
                </p>
                <p className="text-xl font-black text-slate-700 mt-1 font-display">
                  {ranking[2]?.valor}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {meta.etiquetaMetrica}
                </p>
              </div>
            </div>
          )}

          {/* Tabla de Posiciones */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Medal className="w-4 h-4 text-turf-600" />
                <span>{meta.titulo}</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {ranking.length} jugadores clasificados
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {ranking.map((entry, index) => {
                const pos = index + 1;
                return (
                  <div
                    key={entry.jugadorId || index}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                          pos === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : pos === 2
                            ? 'bg-slate-200 text-slate-700'
                            : pos === 3
                            ? 'bg-amber-50 text-amber-900 border border-amber-300'
                            : 'text-slate-400 font-semibold'
                        }`}
                      >
                        {pos}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-semibold">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {entry.jugadorNombre}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-navy-950 font-display">
                        {entry.valor}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5 uppercase tracking-wider">
                        {meta.etiquetaMetrica.toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
