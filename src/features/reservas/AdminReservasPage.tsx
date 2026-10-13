import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import {
  useListarMisSedes,
  useListarTodas,
  useListarReservasPorSede,
} from '@/api/endpoints';
import { formatearHora, formatearPrecio } from '@/features/canchas/utils/tarifa';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Calendar,
  Building2,
  Clock,
  User,
} from 'lucide-react';

export const AdminReservasPage: React.FC = () => {
  const { rol } = useAuth();
  const [sedeSeleccionadaId, setSedeSeleccionadaId] = useState<number | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const queryMisSedes = useListarMisSedes({
    query: {
      enabled: rol === 'ADMIN_SEDE',
    },
  });

  const queryTodasSedes = useListarTodas({
    query: {
      enabled: rol === 'ADMIN',
    },
  });

  const {
    data: sedes = [],
    isLoading: cargandoSedes,
  } = rol === 'ADMIN' ? queryTodasSedes : queryMisSedes;

  useEffect(() => {
    if (sedes.length > 0 && !sedeSeleccionadaId) {
      setSedeSeleccionadaId(sedes[0].id!);
    }
  }, [sedes, sedeSeleccionadaId]);

  const {
    data: reservas = [],
    isLoading: cargandoReservas,
    isError,
    error,
    refetch,
  } = useListarReservasPorSede(
    sedeSeleccionadaId || 0,
    { fecha: fechaSeleccionada },
    {
      query: {
        enabled: !!sedeSeleccionadaId,
      },
    }
  );

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PENDIENTE_PAGO':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CANCELADA':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'COMPLETADA':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Control Diario de Reservas</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          Reservas de la Sede
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Supervisa en tiempo real los turnos programados, confirmados y pagados de tus canchas.
        </p>
      </div>

      {/* Filtros: Sede y Fecha */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Selector de Sede */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sedeSeleccionadaId || ''}
              onChange={(e) => setSedeSeleccionadaId(Number(e.target.value))}
              disabled={cargandoSedes || sedes.length === 0}
              className="w-full sm:w-64 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.distrito})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Fecha */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500">
          {reservas.length} {reservas.length === 1 ? 'reserva registrada' : 'reservas registradas'}
        </div>
      </div>

      {/* Estados */}
      {cargandoReservas && (
        <LoadingSpinner mensaje="Cargando reservas del día..." />
      )}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al consultar las reservas de la sede')}
          onReintentar={() => refetch()}
        />
      )}

      {!cargandoReservas && !isError && reservas.length === 0 && (
        <EmptyState
          titulo="No hay reservas para esta fecha"
          descripcion={`No se encontraron reservas en la sede seleccionada para el día ${fechaSeleccionada}.`}
          icono={<Calendar className="w-8 h-8 text-slate-400" />}
        />
      )}

      {!cargandoReservas && !isError && reservas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservas.map((reserva) => (
            <div
              key={reserva.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {reserva.canchaNombre || 'Cancha'}
                  </h3>
                  <span className="font-mono text-xs text-slate-400">
                    {reserva.codigo}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getEstadoBadge(
                    reserva.estado
                  )}`}
                >
                  {reserva.estado}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {formatearHora(reserva.horaInicio)} - {formatearHora(reserva.horaFin)}
                  </span>
                </div>

                {reserva.organizadorNombre && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Organizador: {reserva.organizadorNombre}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Monto:</span>
                  <span className="font-bold text-emerald-800 text-sm">
                    {formatearPrecio(reserva.precioTotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
