import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useListarTodas } from '@/api/endpoints';
import { formatearHora } from '@/features/canchas/utils/tarifa';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  MapPin,
  Clock,
  Search,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const SedesPage: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [distritoFiltro, setDistritoFiltro] = useState<string>('TODOS');

  const {
    data: sedes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListarTodas();

  // Distritos únicos disponibles
  const distritos = useMemo(() => {
    const set = new Set<string>();
    sedes.forEach((s) => {
      if (s.distrito) set.add(s.distrito);
    });
    return Array.from(set).sort();
  }, [sedes]);

  // Sedes filtradas
  const sedesFiltradas = useMemo(() => {
    return sedes.filter((sede) => {
      const coincideBusqueda =
        !busqueda ||
        sede.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        sede.direccion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        sede.distrito?.toLowerCase().includes(busqueda.toLowerCase());

      const coincideDistrito =
        distritoFiltro === 'TODOS' || sede.distrito === distritoFiltro;

      return coincideBusqueda && coincideDistrito;
    });
  }, [sedes, busqueda, distritoFiltro]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/60 text-emerald-100 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Nuestras Sedes Deportivas
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Encuentra la sede perfecta para tu próximo partido
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100">
            Explora complejos deportivos equipados con la mejor iluminación, tecnología y canchas reglamentarias.
          </p>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, dirección o distrito..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {distritos.length > 0 && (
          <div className="sm:w-56">
            <select
              value={distritoFiltro}
              onChange={(e) => setDistritoFiltro(e.target.value)}
              aria-label="Filtrar por distrito"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="TODOS">Todos los distritos</option>
              {distritos.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Estados: Carga, Error, Vacío */}
      {isLoading && (
        <LoadingSpinner mensaje="Cargando sedes disponibles..." />
      )}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al cargar las sedes')}
          onReintentar={() => refetch()}
        />
      )}

      {!isLoading && !isError && sedesFiltradas.length === 0 && (
        <EmptyState
          titulo="No se encontraron sedes"
          descripcion={
            busqueda || distritoFiltro !== 'TODOS'
              ? 'No hay sedes que coincidan con los filtros aplicados. Intenta con otra búsqueda.'
              : 'Aún no hay sedes registradas en la plataforma.'
          }
          icono={<Building2 className="w-8 h-8 text-slate-400" />}
        />
      )}

      {/* Cuadrícula de Sedes */}
      {!isLoading && !isError && sedesFiltradas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sedesFiltradas.map((sede) => (
            <div
              key={sede.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-800">
                    {sede.nombre}
                  </h2>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      sede.activa
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {sede.activa ? 'Operativa' : 'Cerrada'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600 flex-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span>
                      {sede.direccion}
                      {sede.distrito ? `, ${sede.distrito}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Atención: {formatearHora(sede.horaApertura)} -{' '}
                      {formatearHora(sede.horaCierre)}
                    </span>
                  </div>

                  {sede.activa && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Instalaciones verificadas</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <Link
                    to={`/canchas?sedeId=${sede.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                  >
                    <span>Ver canchas de esta sede</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
