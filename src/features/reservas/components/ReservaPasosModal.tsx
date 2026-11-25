import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useCrear1, usePagar, useCrear2 } from '@/api/endpoints';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import type { PagoRequestTipoPago } from '@/api/model/pagoRequestTipoPago';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getApiErrorMessage } from '@/lib/error-utils';
import { isAxiosError } from 'axios';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Landmark,
  ArrowRight,
  ArrowLeft,
  Trophy,
} from 'lucide-react';

interface ReservaPasosModalProps {
  cancha: CanchaResponse;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  precioEstimado: number;
  isOpen: boolean;
  onClose: () => void;
  onRefreshDisponibilidad: () => void;
}

type Paso = 1 | 2 | 3 | 4;

export const ReservaPasosModal: React.FC<ReservaPasosModalProps> = ({
  cancha,
  fecha,
  horaInicio,
  horaFin,
  precioEstimado,
  isOpen,
  onClose,
  onRefreshDisponibilidad,
}) => {
  const { estaAutenticado, usuario } = useAuth();
  const navigate = useNavigate();

  const [pasoActual, setPasoActual] = useState<Paso>(1);
  const [reservaCreada, setReservaCreada] = useState<ReservaResponse | null>(null);
  const [errorConflicto, setErrorConflicto] = useState<string | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  // Opciones de Pago Simulado
  const [metodoPago, setMetodoPago] = useState<PagoRequestTipoPago>('BILLETERA' as any);
  const referenciaPago = 'OPER-884912';
  const marcaTarjeta = 'VISA';
  const ultimosCuatro = '4242';

  // Mutación: Crear Reserva (Paso 1/2 -> 3)
  const crearReservaMutation = useCrear1({
    mutation: {
      onSuccess: (data) => {
        setReservaCreada(data);
        setErrorConflicto(null);
        setErrorGeneral(null);
        setPasoActual(3); // Avanza a pago simulado
      },
      onError: (err) => {
        if (isAxiosError(err) && err.response?.status === 409) {
          setErrorConflicto(
            'El horario seleccionado acaba de ser reservado por otro jugador. Por favor selecciona otro turno disponible.'
          );
          onRefreshDisponibilidad();
        } else {
          setErrorGeneral(
            getApiErrorMessage(err, 'No se pudo crear la reserva. Por favor intenta nuevamente.')
          );
        }
      },
    },
  });

  // Mutación: Pagar Reserva (Paso 3 -> 4)
  const pagarMutation = usePagar({
    mutation: {
      onSuccess: (data) => {
        setReservaCreada(data);
        setErrorGeneral(null);
        setPasoActual(4); // Avanza a confirmación final
        onRefreshDisponibilidad();
      },
      onError: (err) => {
        setErrorGeneral(getApiErrorMessage(err, 'No se pudo registrar el pago de la reserva.'));
      },
    },
  });

  // Mutación: Crear Partido Oficial desde Reserva Confirmada
  const crearPartidoMutation = useCrear2({
    mutation: {
      onSuccess: (partido) => {
        onClose();
        navigate(`/partidos/${partido.id}`);
      },
      onError: (err) => {
        setErrorGeneral(getApiErrorMessage(err, 'No se pudo inicializar el partido a partir de la reserva.'));
      },
    },
  });

  if (!isOpen) return null;

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

  const handleProcesarPago = () => {
    if (!reservaCreada?.id) return;
    setErrorGeneral(null);

    const payload: any = {
      tipoPago: metodoPago,
      monto: precioEstimado || reservaCreada.precioTotal || 0,
      referencia: referenciaPago,
    };

    if (metodoPago === 'TARJETA') {
      payload.marca = marcaTarjeta;
      payload.ultimosCuatro = ultimosCuatro;
    } else if (metodoPago === 'BILLETERA') {
      payload.proveedor = 'Yape';
      payload.numeroOperacion = referenciaPago;
    } else if (metodoPago === 'TRANSFERENCIA') {
      payload.banco = 'BCP';
      payload.codigoOperacion = referenciaPago;
    }

    pagarMutation.mutate({
      id: reservaCreada.id,
      data: payload,
    });
  };

  const handleCrearPartido = () => {
    if (!reservaCreada?.id) return;
    crearPartidoMutation.mutate({
      params: {
        reservaId: reservaCreada.id,
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        pasoActual === 1
          ? 'Paso 1: Horario Seleccionado'
          : pasoActual === 2
          ? 'Paso 2: Resumen de Reserva'
          : pasoActual === 3
          ? 'Paso 3: Pago Simulado'
          : 'Paso 4: ¡Reserva Confirmada!'
      }
      description={
        pasoActual === 1
          ? 'Verifica los detalles del horario antes de proceder.'
          : pasoActual === 2
          ? 'Asegura tu turno con bloqueo pesimista en base de datos.'
          : pasoActual === 3
          ? 'Elige el método de pago para formalizar tu reserva en soles.'
          : 'Tu turno está asegurado. Puedes organizar tu partido o gestionar tus reservas.'
      }
      size="md"
    >
      <div className="space-y-6">
        {/* Indicador de Pasos 1 a 4 */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          {[
            { num: 1, label: 'Turno' },
            { num: 2, label: 'Resumen' },
            { num: 3, label: 'Pago' },
            { num: 4, label: 'Listo' },
          ].map((s) => (
            <div
              key={s.num}
              className={`pb-2 border-b-2 transition-colors ${
                pasoActual === s.num
                  ? 'border-turf-600 text-turf-700'
                  : pasoActual > s.num
                  ? 'border-turf-300 text-turf-500'
                  : 'border-navy-200 text-navy-400'
              }`}
            >
              <span>{s.num}. {s.label}</span>
            </div>
          ))}
        </div>

        {/* Notificación de Error o Conflicto 409 */}
        {errorConflicto && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold">Conflicto de Horario (HTTP 409)</h5>
              <p>{errorConflicto}</p>
            </div>
          </div>
        )}

        {errorGeneral && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold">Error en la operación</h5>
              <p>{errorGeneral}</p>
            </div>
          </div>
        )}

        {/* Verificación de Autenticación */}
        {!estaAutenticado && pasoActual < 4 && (
          <div className="p-4 rounded-2xl bg-navy-50 border border-navy-200 text-xs text-navy-800 space-y-2">
            <p className="font-bold">Se requiere iniciar sesión para reservar:</p>
            <p className="text-navy-600">Inicia sesión con tu cuenta de jugador para asegurar el turno a tu nombre.</p>
            <div className="pt-2 flex gap-2">
              <Link to="/login" state={{ from: window.location.pathname }}>
                <Button variant="primary" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="outline" size="sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* CONTENIDO DEL PASO 1: HORARIO */}
        {pasoActual === 1 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-navy-50 border border-navy-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-navy-500 uppercase">Cancha</span>
                <span className="font-bold text-navy-900">{cancha.nombre}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-navy-500 uppercase">Fecha</span>
                <span className="font-bold text-navy-900 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-navy-400" />
                  {fecha}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-navy-500 uppercase">Horario</span>
                <span className="font-bold text-navy-900 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-navy-400" />
                  {horaInicio.slice(0, 5)} - {horaFin.slice(0, 5)}
                </span>
              </div>
              <div className="pt-2 border-t border-navy-200 flex items-center justify-between">
                <span className="text-xs font-bold text-navy-700">Precio estimado</span>
                <span className="font-display font-extrabold text-lg text-turf-700">
                  S/. {precioEstimado.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPasoActual(2)}
                disabled={!estaAutenticado}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Continuar a Resumen
              </Button>
            </div>
          </div>
        )}

        {/* CONTENIDO DEL PASO 2: RESUMEN Y BLOQUEO */}
        {pasoActual === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-navy-200 shadow-subtle space-y-3 text-xs">
              <h5 className="font-bold text-sm text-navy-950 pb-2 border-b border-navy-100">
                Resumen de tu Reserva Deportiva
              </h5>
              <div className="flex justify-between">
                <span className="text-navy-500">Organizador:</span>
                <strong className="text-navy-900">{usuario?.nombre} {usuario?.apellido}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Disciplina:</span>
                <strong className="text-navy-900">{cancha.deporte}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Sede:</span>
                <strong className="text-navy-900">{cancha.sedeNombre || 'Sede Principal'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-500">Política de Cancelación:</span>
                <span className="text-navy-700">Hasta 2 horas antes del inicio</span>
              </div>
              <div className="pt-3 border-t border-navy-100 flex justify-between items-center text-sm">
                <span className="font-bold text-navy-900">Total a Pagar:</span>
                <span className="font-display font-extrabold text-lg text-turf-700">
                  S/. {precioEstimado.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setPasoActual(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                Volver
              </Button>
              <Button
                variant="lime"
                size="sm"
                onClick={handleConfirmarReserva}
                isLoading={crearReservaMutation.isPending}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Confirmar y Pasar al Pago
              </Button>
            </div>
          </div>
        )}

        {/* CONTENIDO DEL PASO 3: PAGO SIMULADO */}
        {pasoActual === 3 && (
          <div className="space-y-4">
            <div className="p-3 bg-turf-50 rounded-xl border border-turf-200 text-xs text-turf-900 flex items-center justify-between">
              <span>Reserva #{reservaCreada?.codigo || reservaCreada?.id} generada</span>
              <StatusBadge status="PENDIENTE" size="sm" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-navy-700 uppercase tracking-wider block">
                Selecciona Método de Pago Simulado
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'BILLETERA', label: 'Yape / Plin', icon: Smartphone },
                  { id: 'TARJETA', label: 'Tarjeta Débito/Crédito', icon: CreditCard },
                  { id: 'TRANSFERENCIA', label: 'Transferencia BCP', icon: Landmark },
                ].map((m) => {
                  const Icon = m.icon;
                  const selected = metodoPago === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetodoPago(m.id as any)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-2 transition ${
                        selected
                          ? 'bg-turf-50 border-turf-600 text-turf-900 shadow-sm'
                          : 'bg-white border-navy-200 text-navy-700 hover:bg-navy-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${selected ? 'text-turf-600' : 'text-navy-400'}`} />
                      <span className="text-center">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {metodoPago === 'BILLETERA' && (
              <div className="p-4 bg-navy-50 rounded-2xl border border-navy-200 text-xs space-y-2">
                <p className="text-navy-600">Simulación de pago instantáneo vía billetera móvil:</p>
                <div className="flex items-center justify-between font-mono font-bold text-navy-900">
                  <span>Número de Operación:</span>
                  <span>{referenciaPago}</span>
                </div>
              </div>
            )}

            {metodoPago === 'TARJETA' && (
              <div className="p-4 bg-navy-50 rounded-2xl border border-navy-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-navy-600">Tarjeta Simulación:</span>
                  <strong className="text-navy-900">{marcaTarjeta} ···· {ultimosCuatro}</strong>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="text-xs text-navy-500 block">Monto a debitar</span>
                <span className="font-display font-extrabold text-base text-navy-950">
                  S/. {precioEstimado.toFixed(2)}
                </span>
              </div>
              <Button
                variant="lime"
                size="md"
                onClick={handleProcesarPago}
                isLoading={pagarMutation.isPending}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Pagar S/. {precioEstimado.toFixed(2)}
              </Button>
            </div>
          </div>
        )}

        {/* CONTENIDO DEL PASO 4: CONFIRMACIÓN FINAL */}
        {pasoActual === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-turf-100 text-turf-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="font-display font-extrabold text-xl text-navy-950">
                ¡Tu reserva ha sido pagada y confirmada!
              </h4>
              <p className="text-xs text-navy-500">
                Código oficial: <strong className="font-mono text-navy-900">{reservaCreada?.codigo || `RES-${reservaCreada?.id}`}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-50 border border-navy-200 text-left text-xs space-y-1.5">
              <p className="text-navy-700">
                Cancha: <strong>{cancha.nombre}</strong> ({cancha.sedeNombre})
              </p>
              <p className="text-navy-700">
                Fecha y Turno: <strong>{fecha}</strong> · <strong>{horaInicio.slice(0, 5)} - {horaFin.slice(0, 5)}</strong>
              </p>
              <p className="text-turf-800 font-bold">
                Estado: CONFIRMADA Y PAGADA (S/. {precioEstimado.toFixed(2)})
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="lime"
                size="md"
                className="w-full font-bold"
                onClick={handleCrearPartido}
                isLoading={crearPartidoMutation.isPending}
                icon={<Trophy className="w-4 h-4" />}
              >
                Organizar Partido Ahora
              </Button>
              <Link to="/mis-reservas" onClick={onClose} className="w-full">
                <Button variant="outline" size="md" className="w-full">
                  Ver Mis Reservas
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
