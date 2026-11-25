import React, { useState } from 'react';
import { useRanking, useListarTodas } from '@/api/endpoints';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Trophy,
  Medal,
  Flame,
  Award,
  Building2,
  Calendar,
  User,
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
          colorBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/60 text-amber-100 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Tablas de Posición y Estadísticas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Rankings de Jugadores
        </h1>
        <p className="mt-2 text-sm sm:text-base text-amber-100 max-w-2xl">
          Descubre a las estrellas de la cancha: máximos goleadores, líderes de asistencias y los jugadores más ganadores.
        </p>
      </div>

      {/* Selector de Criterio */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/60 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setCriterio('GOLES')}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
            criterio === 'GOLES'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-emerald-600" />
          <span>Goleadores</span>
        </button>

        <button
          type="button"
          onClick={() => setCriterio('ASISTENCIAS')}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
            criterio === 'ASISTENCIAS'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-blue-600" />
          <span>Asistidores</span>
        </button>

        <button
          type="button"
          onClick={() => setCriterio('VICTORIAS')}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition ${
            criterio === 'VICTORIAS'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Victorias</span>
        </button>
      </div>

      {/* Filtros Opcionales */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Filtro Sede */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sedeId || ''}
              onChange={(e) => setSedeId(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
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
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
          >
            Limpiar filtros
          </button>
        )}
      </div>

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
          descripcion="Los rankings se actualizarán automáticamente a medida que se completen partidos y se registren goles y resultados."
          icono={<Trophy className="w-8 h-8 text-slate-400" />}
        />
      )}

      {/* Tabla de Ranking y Podio */}
      {!isLoading && !isError && ranking.length > 0 && (
        <div className="space-y-6">
          {/* Podio Top 3 */}
          {ranking.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-2xl mx-auto items-end">
              {/* #2 Plata */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-700 mb-2">
                  🥈
                </div>
                <p className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">
                  {ranking[1]?.jugadorNombre}
                </p>
                <p className="text-xl font-extrabold text-slate-700 mt-1">
                  {ranking[1]?.valor}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {meta.etiquetaMetrica}
                </p>
              </div>

              {/* #1 Oro */}
              <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-5 border-2 border-amber-300 shadow-md text-center flex flex-col items-center relative -top-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center font-bold text-amber-700 text-lg mb-2 shadow-inner">
                  👑
                </div>
                <p className="font-extrabold text-sm sm:text-base text-amber-950 line-clamp-1">
                  {ranking[0]?.jugadorNombre}
                </p>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {ranking[0]?.valor}
                </p>
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                  {meta.etiquetaMetrica}
                </p>
              </div>

              {/* #3 Bronce */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 border-2 border-amber-600/40 flex items-center justify-center font-bold text-amber-800 mb-2">
                  🥉
                </div>
                <p className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">
                  {ranking[2]?.jugadorNombre}
                </p>
                <p className="text-xl font-extrabold text-slate-700 mt-1">
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
                <Medal className="w-4 h-4 text-amber-600" />
                <span>{meta.titulo}</span>
              </h2>
              <span className="text-xs text-slate-500">
                {ranking.length} jugadores clasificados
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {ranking.map((entry, index) => {
                const pos = index + 1;
                return (
                  <div
                    key={entry.jugadorId || index}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          pos === 1
                            ? 'bg-amber-100 text-amber-800'
                            : pos === 2
                            ? 'bg-slate-200 text-slate-700'
                            : pos === 3
                            ? 'bg-amber-50 text-amber-900 border border-amber-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {pos}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-semibold">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                          {entry.jugadorNombre}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {entry.valor}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">
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

