import React, { useState, useMemo } from 'react';
import { useReprogramar, useDisponibilidad, useObtenerPorId5 } from '@/api/endpoints';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import {
  formatearHora,
  formatearPrecio,
  generarTurnosHorarios,
  type TurnoSlot,
} from '@/features/canchas/utils/tarifa';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/error-utils';
import { isAxiosError } from 'axios';
import {
  Clock,
  X,
  AlertTriangle,
  Loader2,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';

interface ReprogramarModalProps {
  reserva: ReservaResponse;
  onClose: () => void;
  onSuccess: (reservaActualizada: ReservaResponse) => void;
}

const getFechaHoyISO = (): string => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

export const ReprogramarModal: React.FC<ReprogramarModalProps> = ({
  reserva,
  onClose,
  onSuccess,
}) => {
  const [nuevaFecha, setNuevaFecha] = useState<string>(reserva.fecha || getFechaHoyISO());
  const [slotSeleccionado, setSlotSeleccionado] = useState<TurnoSlot | null>(null);
  const [errorConflicto, setErrorConflicto] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const canchaId = reserva.canchaId ?? 0;

  // Consulta de la cancha para obtener sus tarifas
  const { data: cancha } = useObtenerPorId5(canchaId);

  // Consulta de disponibilidad para la nueva fecha
  const {
    data: disponibilidad,
    isLoading: cargandoDisponibilidad,
    refetch: refetchDisponibilidad,
  } = useDisponibilidad(canchaId, { fecha: nuevaFecha });

  // Slots disponibles para la nueva fecha
  const slotsDisponibles = useMemo(() => {
    if (!cancha || !disponibilidad?.turnosDisponibles) return [];
    return generarTurnosHorarios(
      disponibilidad.turnosDisponibles,
      cancha,
      nuevaFecha,
      60
    );
  }, [cancha, disponibilidad, nuevaFecha]);

  const reprogramarMutation = useReprogramar({
    mutation: {
      onSuccess: (data) => {
        onSuccess(data);
      },
      onError: (err) => {
        if (isAxiosError(err) && err.response?.status === 409) {
          setErrorConflicto(
            'El horario seleccionado ya no está disponible para reprogramar. Selecciona otro turno.'
          );
          refetchDisponibilidad();
        } else {
          setErrorGeneral(
            getApiErrorMessage(err, 'No se pudo reprogramar la reserva.')
          );
        }
      },
    },
  });

  const handleConfirmarReprogramacion = () => {
    if (!reserva.id || !slotSeleccionado) return;
    setErrorConflicto(null);
    setErrorGeneral(null);

    reprogramarMutation.mutate({
      id: reserva.id,
      data: {
        fecha: nuevaFecha,
        horaInicio: slotSeleccionado.inicio,
        horaFin: slotSeleccionado.fin,
      },
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reprogramar-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 id="modal-reprogramar-title" className="text-base font-bold text-slate-800">
              Reprogramar Turno de Reserva
            </h2>
            <p className="text-xs text-slate-500">
              Código: <span className="font-semibold">{reserva.codigo}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de reprogramación"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen Actual */}
        <div className="px-6 py-3 bg-amber-50/60 border-b border-amber-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-amber-950">
              Turno actual:
            </span>
            <p className="text-amber-900">
              {reserva.fecha} ({formatearHora(reserva.horaInicio)} - {formatearHora(reserva.horaFin)})
            </p>
          </div>
          <span className="text-amber-800 font-medium">
            {reserva.canchaNombre}
          </span>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorConflicto && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Conflicto de Horario (409)</p>
                <p>{errorConflicto}</p>
              </div>
            </div>
          )}

          {errorGeneral && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorGeneral}</span>
            </div>
          )}

          {/* Selector de nueva fecha */}
          <div>
            <label htmlFor="nuevaFechaInput" className="text-xs font-semibold text-slate-700 block mb-1">
              Selecciona la nueva fecha
            </label>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <input
                id="nuevaFechaInput"
                type="date"
                min={getFechaHoyISO()}
                value={nuevaFecha}
                onChange={(e) => {
                  setNuevaFecha(e.target.value);
                  setSlotSeleccionado(null);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Turnos disponibles para la nueva fecha */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Turnos disponibles ({nuevaFecha})
              </label>
              <span className="text-[11px] text-slate-500">
                {slotsDisponibles.length} disponibles
              </span>
            </div>

            {cargandoDisponibilidad && (
              <LoadingSpinner mensaje="Consultando turnos disponibles..." tamano="sm" />
            )}

            {!cargandoDisponibilidad && slotsDisponibles.length === 0 && (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg text-center border">
                No hay turnos libres para la fecha seleccionada. Elige otra fecha.
              </p>
            )}

            {!cargandoDisponibilidad && slotsDisponibles.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {slotsDisponibles.map((slot, idx) => {
                  const seleccionado =
                    slotSeleccionado?.inicio === slot.inicio &&
                    slotSeleccionado?.fin === slot.fin;

                  return (
                    <button
                      key={`${slot.inicio}-${idx}`}
                      type="button"
                      onClick={() => setSlotSeleccionado(slot)}
                      className={`p-2.5 rounded-lg border text-xs text-left transition flex items-center justify-between ${
                        seleccionado
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {formatearHora(slot.inicio)} - {formatearHora(slot.fin)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formatearPrecio(slot.precio)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {slotSeleccionado && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Nuevo turno: <strong>{nuevaFecha}</strong> de{' '}
                <strong>{formatearHora(slotSeleccionado.inicio)} a {formatearHora(slotSeleccionado.fin)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={reprogramarMutation.isPending}
            className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmarReprogramacion}
            disabled={!slotSeleccionado || reprogramarMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {reprogramarMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reprogramando...</span>
              </>
            ) : (
              <span>Confirmar Reprogramación</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
