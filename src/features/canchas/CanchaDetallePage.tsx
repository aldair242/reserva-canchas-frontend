import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useObtenerPorId5, useDisponibilidad } from '@/api/endpoints';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import {
  formatearHora,
  formatearPrecio,
  generarTurnosHorarios,
  type TurnoSlot,
} from './utils/tarifa';
import { ReservarModal } from '@/features/reservas/components/ReservarModal';
import { PagoModal } from '@/features/reservas/components/PagoModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Calendar,
  Clock,
  Layers,
  Shield,
  Sun,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

const getFechaHoyISO = (): string => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const getFechaOffsetISO = (dias: number): string => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

export const CanchaDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const canchaId = Number(id);

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(getFechaHoyISO());
  const [slotParaReservar, setSlotParaReservar] = useState<TurnoSlot | null>(null);
  const [reservaParaPagar, setReservaParaPagar] = useState<ReservaResponse | null>(null);

  // Consulta de datos de la cancha
  const {
    data: cancha,
    isLoading: cargandoCancha,
    isError: errorCancha,
    error: errCanchaObj,
    refetch: refetchCancha,
  } = useObtenerPorId5(canchaId);

  // Consulta de disponibilidad para la fecha
  const {
    data: disponibilidadData,
    isLoading: cargandoDisponibilidad,
    isError: errorDisponibilidad,
    error: errDispObj,
    refetch: refetchDisponibilidad,
  } = useDisponibilidad(canchaId, { fecha: fechaSeleccionada });

  // Lista de días rápidos: Hoy, Mañana, +2 días, +3 días, +4 días
  const diasRapidos = useMemo(() => {
    return [
      { etiqueta: 'Hoy', fecha: getFechaHoyISO() },
      { etiqueta: 'Mañana', fecha: getFechaOffsetISO(1) },
      { etiqueta: '+2 días', fecha: getFechaOffsetISO(2) },
      { etiqueta: '+3 días', fecha: getFechaOffsetISO(3) },
      { etiqueta: '+4 días', fecha: getFechaOffsetISO(4) },
    ];
  }, []);

  // Generar turnos horarios regulares desglosados con precio calculado
  const turnosDesglosados = useMemo(() => {
    if (!cancha || !disponibilidadData?.turnosDisponibles) return [];
    return generarTurnosHorarios(
      disponibilidadData.turnosDisponibles,
      cancha,
      fechaSeleccionada,
      60
    );
  }, [cancha, disponibilidadData, fechaSeleccionada]);

  // Manejo de carga de datos principales
  if (cargandoCancha) {
    return <LoadingSpinner mensaje="Cargando detalles de la cancha..." className="py-20" />;
  }

  if (errorCancha || !cancha) {
    return (
      <div className="py-12 space-y-4">
        <ErrorMessage
          mensaje={getApiErrorMessage(errCanchaObj, 'No se pudo cargar la información de la cancha')}
          onReintentar={() => refetchCancha()}
        />
        <Link
          to="/canchas"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo de canchas</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón de Retorno */}
      <div>
        <Link
          to="/canchas"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al catálogo de canchas</span>
        </Link>
      </div>

      {/* Encabezado y Datos de Cancha */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {cancha.deporte}
              </span>
              {cancha.deporte === 'FUTBOL' && cancha.formato && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {cancha.formato}
                </span>
              )}
              {cancha.deporte === 'BASQUET' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {cancha.medioCampo ? 'Medio campo' : 'Cancha completa'}
                </span>
              )}
              {cancha.deporte === 'VOLEY' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {cancha.esDePlaya ? 'Playa' : 'Pista'} · Red {cancha.alturaRed}m
                </span>
              )}
              {cancha.deporte === 'PADEL' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {cancha.paredesDeVidrio ? 'Cristal' : 'Estándar'}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {cancha.nombre}
            </h1>
            {cancha.sedeNombre && (
              <p className="text-sm text-slate-600 mt-1">
                Ubicada en <span className="font-semibold text-slate-800">{cancha.sedeNombre}</span>
              </p>
            )}
          </div>

          {/* Tarifa destacada */}
          <div className="sm:text-right bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Estrategia tarifaria: {cancha.tipoTarifa}
            </span>
            {cancha.tipoTarifa === 'ESTANDAR' && (
              <div className="text-xl font-black text-slate-800">
                {formatearPrecio(cancha.precioHora)}{' '}
                <span className="text-xs font-normal text-slate-500">/ hora</span>
              </div>
            )}
            {cancha.tipoTarifa === 'HORA_PICO' && (
              <div>
                <span className="text-sm font-bold text-slate-800">
                  Normal: {formatearPrecio(cancha.precioNormal)} /h
                </span>
                <span className="text-xs font-bold text-rose-600 block">
                  Pico: {formatearPrecio(cancha.precioPico)} /h ({formatearHora(cancha.inicioPico)} a {formatearHora(cancha.finPico)})
                </span>
              </div>
            )}
            {cancha.tipoTarifa === 'PROMOCIONAL' && (
              <div>
                <span className="text-xs font-bold text-amber-600">
                  {cancha.porcentajeDescuento}% de descuento
                </span>
                <div className="text-xl font-black text-slate-800">
                  {formatearPrecio((cancha.precioHora || 0) * (1 - (cancha.porcentajeDescuento || 0) / 100))}
                  <span className="text-xs font-normal text-slate-500"> /h</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ficha técnica de la cancha */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Superficie: <strong className="text-slate-800">{cancha.superficie || 'Estándar'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {cancha.techada ? (
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Techada
                </span>
              ) : (
                <span className="text-slate-500 inline-flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-slate-400" /> Al aire libre
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {cancha.iluminacion ? (
                <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Iluminación
                </span>
              ) : (
                <span className="text-slate-500 inline-flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-slate-400" /> Sin luz
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Horario: {disponibilidadData ? `${formatearHora(disponibilidadData.horaApertura)} - ${formatearHora(disponibilidadData.horaCierre)}` : 'Atención regular'}
            </span>
          </div>
        </div>
      </div>

      {/* Selector de Fecha */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-800">
              Seleccionar Fecha de Reserva
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="fechaInput" className="text-xs font-semibold text-slate-600">
              Fecha:
            </label>
            <input
              id="fechaInput"
              type="date"
              min={getFechaHoyISO()}
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Acceso Rápido a Días */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {diasRapidos.map((d) => {
            const activo = fechaSeleccionada === d.fecha;
            return (
              <button
                key={d.fecha}
                type="button"
                onClick={() => setFechaSeleccionada(d.fecha)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activo
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d.etiqueta} ({d.fecha.slice(5)})
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloqueos o Mantenimientos Programados */}
      {disponibilidadData?.bloqueos && disponibilidadData.bloqueos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mantenimientos / Bloqueos programados para esta fecha:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-900 pl-1">
            {disponibilidadData.bloqueos.map((b, idx) => (
              <li key={idx}>
                {b.motivo || 'Mantenimiento programado'}: {b.inicio ? new Date(b.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} -{' '}
                {b.fin ? new Date(b.fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Turnos Horarios Disponibles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Turnos Disponibles ({fechaSeleccionada})</span>
          </h3>
          <span className="text-xs text-slate-500">
            {turnosDesglosados.length} {turnosDesglosados.length === 1 ? 'turno libre' : 'turnos libres'}
          </span>
        </div>

        {cargandoDisponibilidad && (
          <LoadingSpinner mensaje="Consultando disponibilidad de turnos..." />
        )}

        {errorDisponibilidad && (
          <ErrorMessage
            mensaje={getApiErrorMessage(errDispObj, 'No se pudo consultar la disponibilidad para esta fecha')}
            onReintentar={() => refetchDisponibilidad()}
          />
        )}

        {!cargandoDisponibilidad && !errorDisponibilidad && turnosDesglosados.length === 0 && (
          <EmptyState
            titulo="No hay turnos disponibles para esta fecha"
            descripcion="La cancha ya tiene todas sus horas reservadas o se encuentra cerrada por mantenimiento. Por favor selecciona otra fecha."
            icono={<Calendar className="w-8 h-8 text-slate-400" />}
          />
        )}

        {!cargandoDisponibilidad && !errorDisponibilidad && turnosDesglosados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {turnosDesglosados.map((slot, index) => (
              <div
                key={`${slot.inicio}-${slot.fin}-${index}`}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-slate-800">
                      {formatearHora(slot.inicio)} - {formatearHora(slot.fin)}
                    </span>
                    {slot.esHoraPico && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Hora Pico
                      </span>
                    )}
                    {slot.esPromocion && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Promo
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-black text-emerald-700 mb-3">
                    {formatearPrecio(slot.precio)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSlotParaReservar(slot)}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reservar este turno</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Reserva */}
      {slotParaReservar && (
        <ReservarModal
          cancha={cancha}
          fecha={fechaSeleccionada}
          horaInicio={slotParaReservar.inicio}
          horaFin={slotParaReservar.fin}
          precioEstimado={slotParaReservar.precio}
          onClose={() => setSlotParaReservar(null)}
          onSuccess={() => {
            // Refrescar disponibilidad de inmediato tras reservar con éxito
            refetchDisponibilidad();
          }}
          onRefreshDisponibilidad={() => {
            refetchDisponibilidad();
          }}
          onAbrirPago={(reserva) => {
            setSlotParaReservar(null);
            setReservaParaPagar(reserva);
          }}
        />
      )}

      {/* Modal de Pago */}
      {reservaParaPagar && (
        <PagoModal
          reserva={reservaParaPagar}
          onClose={() => setReservaParaPagar(null)}
          onSuccess={() => {
            setReservaParaPagar(null);
            refetchDisponibilidad();
          }}
        />
      )}
    </div>
  );
};
