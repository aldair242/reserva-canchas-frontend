import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useCrear1 } from '@/api/endpoints';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import { formatearPrecio, formatearHora } from '@/features/canchas/utils/tarifa';
import { getApiErrorMessage } from '@/lib/error-utils';
import { isAxiosError } from 'axios';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  X,
  CreditCard,
  ArrowRight,
  Loader2,
  LogIn,
} from 'lucide-react';

interface ReservarModalProps {
  cancha: CanchaResponse;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precioEstimado: number;
  onClose: () => void;
  onSuccess: (reservaCreada: ReservaResponse) => void;
  onRefreshDisponibilidad: () => void;
  onAbrirPago?: (reserva: ReservaResponse) => void;
}

export const ReservarModal: React.FC<ReservarModalProps> = ({
  cancha,
  fecha,
  horaInicio,
  horaFin,
  precioEstimado,
  onClose,
  onSuccess,
  onRefreshDisponibilidad,
  onAbrirPago,
}) => {
  const { estaAutenticado, rol } = useAuth();
  const navigate = useNavigate();

  const [errorConflicto, setErrorConflicto] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [reservaCreada, setReservaCreada] = useState<ReservaResponse | null>(null);

  const crearReservaMutation = useCrear1({
    mutation: {
      onSuccess: (data) => {
        setReservaCreada(data);
        onSuccess(data);
      },
      onError: (err) => {
        if (isAxiosError(err) && err.response?.status === 409) {
          setErrorConflicto(
            'El horario seleccionado ya no está disponible. Por favor, selecciona otro turno disponible.'
          );
          // Refrescar turnos disponibles automáticamente para reflejar el estado actual
          onRefreshDisponibilidad();
        } else {
          setErrorGeneral(
            getApiErrorMessage(err, 'No se pudo crear la reserva. Intenta de nuevo.')
          );
        }
      },
    },
  });

  const handleConfirmarReserva = () => {
    if (!cancha.id) return;
    setErrorConflicto(null);
    setErrorGeneral(null);

    crearReservaMutation.mutate({
      data: {
        canchaId: cancha.id,
        fecha,
        horaInicio,
        horaFin,
      },
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reserva-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 id="modal-reserva-title" className="text-lg font-bold text-slate-800">
              Confirmar Reserva
            </h2>
            <p className="text-xs text-slate-500">
              Revisa los detalles antes de reservar tu turno
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de reserva"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido si el usuario no está autenticado */}
        {!estaAutenticado && (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Inicia sesión para reservar
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Debes tener una cuenta de jugador para poder completar la reserva de una cancha deportiva.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <Link
                to="/login"
                state={{ from: `/canchas/${cancha.id}` }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <span>Iniciar sesión</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Contenido si el usuario tiene rol que no es jugador */}
        {estaAutenticado && rol !== 'JUGADOR' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Rol administrativo detectado
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Las reservas de jugadores se realizan con una cuenta de rol JUGADOR. Estás navegando como {rol}.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Contenido para JUGADOR autenticado */}
        {estaAutenticado && rol === 'JUGADOR' && (
          <>
            {reservaCreada ? (
              /* Pantalla de Éxito */
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    ¡Reserva creada con éxito!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Código de confirmación:
                  </p>
                  <p className="text-base font-extrabold text-emerald-700 tracking-wider mt-0.5">
                    {reservaCreada.codigo}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cancha:</span>
                    <span className="font-semibold text-slate-800">{cancha.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha y Hora:</span>
                    <span className="font-semibold text-slate-800">
                      {fecha} ({formatearHora(horaInicio)} - {formatearHora(horaFin)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monto total:</span>
                    <span className="font-bold text-emerald-700">
                      {formatearPrecio(reservaCreada.precioTotal)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/mis-reservas');
                    }}
                    className="px-4 py-2 border border-slate-300 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Ver mis reservas
                  </button>
                  {onAbrirPago && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onAbrirPago(reservaCreada);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pagar ahora ({formatearPrecio(reservaCreada.precioTotal)})</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Resumen y Confirmación */
              <div className="p-6 space-y-4">
                {/* Alerta de Conflicto 409 */}
                {errorConflicto && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Horario no disponible (Conflicto 409)</p>
                      <p className="mt-0.5">{errorConflicto}</p>
                    </div>
                  </div>
                )}

                {/* Error General */}
                {errorGeneral && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorGeneral}</span>
                  </div>
                )}

                {/* Tarjeta de Resumen */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {cancha.nombre}
                      </h4>
                      {cancha.sedeNombre && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cancha.sedeNombre}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {cancha.deporte}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>{fecha}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>
                        {formatearHora(horaInicio)} - {formatearHora(horaFin)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">
                      Precio total estimado:
                    </span>
                    <span className="text-base font-extrabold text-emerald-800">
                      {formatearPrecio(precioEstimado)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  Al confirmar, tu reserva quedará en estado <strong>PENDIENTE</strong> para su pago y confirmación definitiva.
                </p>

                {/* Acciones */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={crearReservaMutation.isPending}
                    className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmarReserva}
                    disabled={crearReservaMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    {crearReservaMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Confirmando...</span>
                      </>
                    ) : (
                      <span>Confirmar Reserva</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
