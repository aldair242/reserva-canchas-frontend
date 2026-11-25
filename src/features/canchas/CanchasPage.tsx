import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useListarTodas1, useListarTodas } from '@/api/endpoints';
import type { ListarTodas1Deporte } from '@/api/model/listarTodas1Deporte';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import { CanchaCard } from './components/CanchaCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Grid,
  SunMedium,
  Zap,
  MapPin,
  X,
} from 'lucide-react';

const DEPORTES: { valor: ListarTodas1Deporte | 'TODOS'; etiqueta: string }[] = [
  { valor: 'TODOS', etiqueta: 'Todos los deportes' },
  { valor: 'FUTBOL', etiqueta: 'Fútbol' },
  { valor: 'BASQUET', etiqueta: 'Básquet' },
  { valor: 'VOLEY', etiqueta: 'Vóley' },
  { valor: 'PADEL', etiqueta: 'Pádel' },
];

export const CanchasPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const sedeIdParam = searchParams.get('sedeId');
  const deporteParam = searchParams.get('deporte');
  const techadaParam = searchParams.get('techada');
  const iluminacionParam = searchParams.get('iluminacion');

  const sedeId = sedeIdParam ? Number(sedeIdParam) : undefined;
  const deporte =
    deporteParam && deporteParam !== 'TODOS'
      ? (deporteParam as ListarTodas1Deporte)
      : undefined;

  // Sedes para el filtro
  const { data: sedes = [] } = useListarTodas();

  // Canchas desde la API
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

  const DEMO_CANCHAS: CanchaResponse[] = [
    {
      id: 1,
      nombre: 'Cancha 1 - Fútbol 7 Césped Pro',
      deporte: 'FUTBOL',
      formato: 'FUTBOL_7',
      superficie: 'CESPED_SINTETICO' as any,
      techada: true,
      iluminacion: true,
      precioHora: 120,
      sedeNombre: 'Sede Central San Isidro',
    },
    {
      id: 2,
      nombre: 'Cancha 2 - Básquet Oficial FIBA',
      deporte: 'BASQUET',
      medioCampo: false,
      superficie: 'PARQUET' as any,
      techada: true,
      iluminacion: true,
      precioHora: 90,
      sedeNombre: 'Sede San Borja',
    },
    {
      id: 3,
      nombre: 'Cancha 3 - Pádel Panorámica Cristal',
      deporte: 'PADEL',
      paredesDeVidrio: true,
      superficie: 'CESPED_SINTETICO' as any,
      techada: true,
      iluminacion: true,
      precioHora: 110,
      sedeNombre: 'Sede Miraflores',
    },
    {
      id: 4,
      nombre: 'Cancha 4 - Vóley Playa Arena Fina',
      deporte: 'VOLEY',
      esDePlaya: true,
      superficie: 'ARENA' as any,
      techada: false,
      iluminacion: true,
      precioHora: 80,
      sedeNombre: 'Sede Costa Verde',
    },
  ];

  const listaCanchasBase = canchas.length > 0 ? canchas : DEMO_CANCHAS;

  // Filtros adicionales en cliente para techada e iluminación
  const canchasFiltradas = useMemo(() => {
    return listaCanchasBase.filter((c: CanchaResponse) => {
      if (deporte && c.deporte !== deporte) return false;
      if (sedeId && c.sedeId !== sedeId) return false;
      if (techadaParam === 'true' && !c.techada) return false;
      if (techadaParam === 'false' && c.techada) return false;
      if (iluminacionParam === 'true' && !c.iluminacion) return false;
      return true;
    });
  }, [listaCanchasBase, deporte, sedeId, techadaParam, iluminacionParam]);

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

  const toggleTechada = () => {
    const params = new URLSearchParams(searchParams);
    if (techadaParam === 'true') {
      params.delete('techada');
    } else {
      params.set('techada', 'true');
    }
    setSearchParams(params);
  };

  const toggleIluminacion = () => {
    const params = new URLSearchParams(searchParams);
    if (iluminacionParam === 'true') {
      params.delete('iluminacion');
    } else {
      params.set('iluminacion', 'true');
    }
    setSearchParams(params);
  };

  const limpiarFiltros = () => {
    setSearchParams({});
  };

  const hayFiltrosActivos = useMemo(() => {
    return (
      !!sedeIdParam ||
      (!!deporteParam && deporteParam !== 'TODOS') ||
      !!techadaParam ||
      !!iluminacionParam
    );
  }, [sedeIdParam, deporteParam, techadaParam, iluminacionParam]);

  return (
    <div className="space-y-8">
      {/* Encabezado Deportivo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-turf-950 text-white p-6 sm:p-10 border border-navy-800 shadow-xl">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-turf-500/10 border border-turf-500/30 text-turf-300 text-xs font-semibold">
            <Grid className="w-3.5 h-3.5 text-limeAccent-400" />
            <span>Catálogo Oficial de Canchas</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            Encuentra y reserva tu cancha ideal
          </h1>
          <p className="text-xs sm:text-sm text-navy-200 leading-relaxed">
            Filtra por disciplina deportiva, sede, características de techo o iluminación artificial nocturna y reserva tu turno en segundos.
          </p>
        </div>
      </div>

      {/* Barra de Filtros Deportivos */}
      <Card variant="default" className="p-5 space-y-5">
        {/* Selector de Deporte */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-navy-600 uppercase tracking-wider block">
              Disciplina Deportiva
            </label>
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {DEPORTES.map((d) => {
              const seleccionado =
                (!deporte && d.valor === 'TODOS') || deporte === d.valor;
              return (
                <button
                  key={d.valor}
                  type="button"
                  onClick={() => handleDeporteChange(d.valor)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    seleccionado
                      ? 'bg-turf-600 border-turf-700 text-white shadow-sm'
                      : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
                  }`}
                >
                  {d.etiqueta}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros Secundarios: Sede, Techada e Iluminación */}
        <div className="pt-4 border-t border-navy-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 max-w-xs w-full">
            <MapPin className="w-4 h-4 text-navy-400 shrink-0" />
            <select
              value={sedeIdParam || 'TODAS'}
              onChange={(e) => handleSedeChange(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-navy-50 rounded-xl border border-navy-200 text-navy-900 focus:outline-none focus:ring-2 focus:ring-turf-600 font-medium"
              aria-label="Filtrar por sede"
            >
              <option value="TODAS">Todas las sedes disponibles</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} {s.distrito ? `(${s.distrito})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleTechada}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                techadaParam === 'true'
                  ? 'bg-navy-900 border-navy-950 text-white shadow-sm'
                  : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
              }`}
            >
              <SunMedium className="w-3.5 h-3.5" />
              <span>Solo Techadas</span>
            </button>

            <button
              type="button"
              onClick={toggleIluminacion}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                iluminacionParam === 'true'
                  ? 'bg-limeAccent-400 border-limeAccent-500 text-navy-950 font-bold shadow-sm'
                  : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Con Iluminación</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Resultados de Canchas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'No se pudo cargar el catálogo de canchas')}
          onReintentar={() => refetch()}
        />
      ) : canchasFiltradas.length === 0 ? (
        <EmptyState
          titulo="No hay canchas con los filtros seleccionados"
          descripcion="Prueba restableciendo los filtros o seleccionando otra sede o deporte."
          accion={
            <Button variant="outline" size="sm" onClick={limpiarFiltros}>
              Restablecer filtros
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-navy-500">
            <span>
              Mostrando <strong>{canchasFiltradas.length}</strong> canchas activas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {canchasFiltradas.map((cancha: CanchaResponse) => (
              <CanchaCard key={cancha.id} cancha={cancha} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
