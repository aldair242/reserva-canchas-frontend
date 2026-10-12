import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useListarMisReservas } from '@/api/endpoints';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import { formatearHora, formatearPrecio } from '@/features/canchas/utils/tarifa';
import { PagoModal } from './components/PagoModal';
import { CancelarModal } from './components/CancelarModal';
import { ReprogramarModal } from './components/ReprogramarModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Calendar,
  Clock,
  CreditCard,
  XCircle,
  RotateCw,
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

type FiltroEstado = 'TODAS' | 'PENDIENTE' | 'CONFIRMADA' | 'HISTORIAL';

export const MisReservasPage: React.FC = () => {
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODAS');

  const [reservaParaPagar, setReservaParaPagar] = useState<ReservaResponse | null>(null);
  const [reservaParaCancelar, setReservaParaCancelar] = useState<ReservaResponse | null>(null);
  const [reservaParaReprogramar, setReservaParaReprogramar] = useState<ReservaResponse | null>(null);

  const {
    data: reservas = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListarMisReservas();

  // Filtrado según la pestaña activa
  const reservasFiltradas = useMemo(() => {
    if (filtroEstado === 'TODAS') return reservas;
    if (filtroEstado === 'PENDIENTE') {
      return reservas.filter((r) => r.estado === 'PENDIENTE');
    }
    if (filtroEstado === 'CONFIRMADA') {
      return reservas.filter((r) => r.estado === 'CONFIRMADA');
    }
    if (filtroEstado === 'HISTORIAL') {
      return reservas.filter(
        (r) =>
          r.estado === 'CANCELADA' ||
          r.estado === 'COMPLETADA' ||
          r.estado === 'NO_SHOW'
      );
    }
    return reservas;
  }, [reservas, filtroEstado]);

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case 'CONFIRMADA':
        return {
          label: 'Confirmada',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
      case 'PENDIENTE':
        return {
          label: 'Pendiente',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Clock,
        };
      case 'CANCELADA':
        return {
          label: 'Cancelada',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
        };
      case 'COMPLETADA':
        return {
          label: 'Completada',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle2,
        };
      case 'NO_SHOW':
        return {
          label: 'No presentado',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: AlertCircle,
        };
      default:
        return {
          label: estado || 'Desconocido',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: HelpCircle,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/60 text-emerald-100 text-xs font-semibold mb-3">
            <Calendar className="w-3.5 h-3.5" />
            Panel del Jugador
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mis Reservas de Canchas
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100">
            Administra tus turnos programados, realiza pagos pendientes, reprograma horarios o cancela tus reservas.
          </p>
        </div>
      </div>

      {/* Pestañas de Filtro */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: 'TODAS', label: 'Todas' },
            { id: 'PENDIENTE', label: 'Pendientes' },
            { id: 'CONFIRMADA', label: 'Confirmadas' },
            { id: 'HISTORIAL', label: 'Historial' },
          ] as const
        ).map((tab) => {
          const activa = filtroEstado === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroEstado(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activa
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Estados: Carga, Error, Vacío */}
      {isLoading && (
        <LoadingSpinner mensaje="Cargando tus reservas..." />
      )}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al obtener tus reservas')}
          onReintentar={() => refetch()}
        />
      )}

      {!isLoading && !isError && reservasFiltradas.length === 0 && (
        <EmptyState
          titulo="No tienes reservas registradas"
          descripcion={
            filtroEstado !== 'TODAS'
              ? 'No hay reservas que coincidan con la pestaña seleccionada.'
              : 'Aún no has realizado ninguna reserva de cancha deportiva.'
          }
          icono={<Calendar className="w-8 h-8 text-slate-400" />}
          accion={
            <Link
              to="/canchas"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <span>Explorar catálogo de canchas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      )}

      {/* Listado de Reservas */}
      {!isLoading && !isError && reservasFiltradas.length > 0 && (
        <div className="space-y-4">
          {reservasFiltradas.map((reserva) => {
            const badge = getEstadoBadge(reserva.estado);
            const BadgeIcon = badge.icon;
            const esActiva =
              reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA';

            return (
              <div
                key={reserva.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Detalles de la reserva */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {reserva.codigo || `#${reserva.id}`}
                    </span>

                    {reserva.pagada ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Pagada
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pendiente de pago
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800">
                    {reserva.canchaNombre || `Cancha #${reserva.canchaId}`}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-medium text-slate-800">{reserva.fecha}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {formatearHora(reserva.horaInicio)} -{' '}
                        {formatearHora(reserva.horaFin)}
                      </span>
                    </div>

                    <div>
                      Monto: <strong className="text-slate-800">{formatearPrecio(reserva.precioTotal)}</strong>
                    </div>
                  </div>

                  {/* Motivo de cancelación si aplica */}
                  {reserva.motivoCancelacion && (
                    <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100 mt-2">
                      <strong>Motivo de cancelación:</strong> {reserva.motivoCancelacion}
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Pagar si está pendiente y no pagada */}
                  {reserva.estado === 'PENDIENTE' && !reserva.pagada && (
                    <button
                      type="button"
                      onClick={() => setReservaParaPagar(reserva)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pagar ahora</span>
                    </button>
                  )}

                  {/* Reprogramar si está pendiente o confirmada */}
                  {esActiva && (
                    <button
                      type="button"
                      onClick={() => setReservaParaReprogramar(reserva)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Reprogramar</span>
                    </button>
                  )}

                  {/* Cancelar si está pendiente o confirmada */}
                  {esActiva && (
                    <button
                      type="button"
                      onClick={() => setReservaParaCancelar(reserva)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold rounded-lg transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  )}

                  {/* Enlace al partido si existe partidoId (Prompt B / F1 / F2) */}
                  {reserva.partidoId && (
                    <Link
                      to={`/partidos/${reserva.partidoId}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Ver Partido</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {reservaParaPagar && (
        <PagoModal
          reserva={reservaParaPagar}
          onClose={() => setReservaParaPagar(null)}
          onSuccess={() => {
            setReservaParaPagar(null);
            refetch();
          }}
        />
      )}

      {reservaParaCancelar && (
        <CancelarModal
          reserva={reservaParaCancelar}
          onClose={() => setReservaParaCancelar(null)}
          onSuccess={() => {
            setReservaParaCancelar(null);
            refetch();
          }}
        />
      )}

      {reservaParaReprogramar && (
        <ReprogramarModal
          reserva={reservaParaReprogramar}
          onClose={() => setReservaParaReprogramar(null)}
          onSuccess={() => {
            setReservaParaReprogramar(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};
