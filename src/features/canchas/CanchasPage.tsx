import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListarTodas1, useListarTodas } from '@/api/endpoints';
import type { ListarTodas1Deporte } from '@/api/model/listarTodas1Deporte';
import { CanchaCard } from './components/CanchaCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import { Grid, Filter, RefreshCw } from 'lucide-react';

const DEPORTES: { valor: ListarTodas1Deporte | 'TODOS'; etiqueta: string; emoji: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos los deportes', emoji: '🏆' },
  { valor: 'FUTBOL', etiqueta: 'Fútbol', emoji: '⚽' },
  { valor: 'BASQUET', etiqueta: 'Básquet', emoji: '🏀' },
  { valor: 'VOLEY', etiqueta: 'Vóley', emoji: '🏐' },
  { valor: 'PADEL', etiqueta: 'Pádel', emoji: '🎾' },
];

export const CanchasPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const sedeIdParam = searchParams.get('sedeId');
  const deporteParam = searchParams.get('deporte');

  const sedeId = sedeIdParam ? Number(sedeIdParam) : undefined;
  const deporte = deporteParam && deporteParam !== 'TODOS' ? (deporteParam as ListarTodas1Deporte) : undefined;

  // Sedes para el filtro desplegable
  const { data: sedes = [] } = useListarTodas();

  // Canchas filtradas
  const {
    data: canchas = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListarTodas1({
    sedeId,
    deporte,
  });

  const handleDeporteChange = (nuevoDeporte: string) => {
    const params = new URLSearchParams(searchParams);
    if (nuevoDeporte === 'TODOS') {
      params.delete('deporte');
    } else {
      params.set('deporte', nuevoDeporte);
    }
    setSearchParams(params);
  };

  const handleSedeChange = (nuevaSedeId: string) => {
    const params = new URLSearchParams(searchParams);
    if (nuevaSedeId === 'TODAS') {
      params.delete('sedeId');
    } else {
      params.set('sedeId', nuevaSedeId);
    }
    setSearchParams(params);
  };

  const limpiarFiltros = () => {
    setSearchParams({});
  };

  const hayFiltrosActivos = useMemo(() => {
    return !!sedeIdParam || (!!deporteParam && deporteParam !== 'TODOS');
  }, [sedeIdParam, deporteParam]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/60 text-emerald-100 text-xs font-semibold mb-3">
            <Grid className="w-3.5 h-3.5" />
            Catálogo de Canchas
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Reserva tu cancha ideal en minutos
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100">
            Filtra por tu deporte favorito y tu sede de preferencia para descubrir disponibilidad al instante.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-4">
        {/* Selector de Deporte (Pestañas / Botones) */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
            Disciplina deportiva
          </label>
          <div className="flex flex-wrap gap-2">
            {DEPORTES.map((d) => {
              const seleccionado =
                (!deporte && d.valor === 'TODOS') || deporte === d.valor;
              return (
                <button
                  key={d.valor}
                  type="button"
                  onClick={() => handleDeporteChange(d.valor)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition ${
                    seleccionado
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{d.emoji}</span>
                  <span>{d.etiqueta}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro por Sede y Limpieza */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sedeId ? String(sedeId) : 'TODAS'}
              onChange={(e) => handleSedeChange(e.target.value)}
              aria-label="Filtrar por sede"
              className="w-full sm:w-72 px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="TODAS">Todas las sedes</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.distrito || 'Sede'})
                </option>
              ))}
            </select>
          </div>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Estados: Carga, Error, Vacío */}
      {isLoading && (
        <LoadingSpinner mensaje="Cargando canchas deportivas..." />
      )}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al cargar las canchas')}
          onReintentar={() => refetch()}
        />
      )}

      {!isLoading && !isError && canchas.length === 0 && (
        <EmptyState
          titulo="No se encontraron canchas"
          descripcion={
            hayFiltrosActivos
              ? 'No encontramos canchas para los filtros seleccionados. Prueba cambiando el deporte o la sede.'
              : 'Aún no hay canchas registradas en el catálogo.'
          }
          icono={<Grid className="w-8 h-8 text-slate-400" />}
          accion={
            hayFiltrosActivos ? (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Ver todas las canchas
              </button>
            ) : undefined
          }
        />
      )}

      {/* Cuadrícula de Canchas */}
      {!isLoading && !isError && canchas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canchas.map((cancha) => (
            <CanchaCard key={cancha.id} cancha={cancha} />
          ))}
        </div>
      )}
    </div>
  );
};
