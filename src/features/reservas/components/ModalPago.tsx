import React, { useState } from 'react';
import { usePagar } from '@/api/endpoints';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import type { PagoRequestTipoPago } from '@/api/model/pagoRequestTipoPago';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface ModalPagoProps {
  reserva: ReservaResponse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reservaActualizada: ReservaResponse) => void;
}

export const ModalPago: React.FC<ModalPagoProps> = ({
  reserva,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [metodoPago, setMetodoPago] = useState<PagoRequestTipoPago>('BILLETERA');
  const [referencia, setReferencia] = useState('');
  const [errorPago, setErrorPago] = useState<string | null>(null);

  const pagarMutation = usePagar({
    mutation: {
      onSuccess: (reservaActualizada) => {
        setErrorPago(null);
        onSuccess(reservaActualizada);
      },
      onError: (err) => {
        setErrorPago(getApiErrorMessage(err, 'No se pudo procesar el pago de la reserva.'));
      },
    },
  });

  const handlePagar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserva.id) return;
    setErrorPago(null);

    const refFinal = referencia.trim() || `SIM-${metodoPago}-${Date.now().toString().slice(-6)}`;

    const dataPayload: any = {
      tipoPago: metodoPago,
      monto: Number(reserva.precioTotal || 0),
      referencia: refFinal,
    };

    if (metodoPago === 'BILLETERA') {
      dataPayload.proveedor = 'YAPE';
      dataPayload.numeroOperacion = refFinal;
    } else if (metodoPago === 'TARJETA') {
      dataPayload.marca = 'VISA';
      dataPayload.ultimosCuatro = '4242';
    } else if (metodoPago === 'TRANSFERENCIA') {
      dataPayload.banco = 'BCP';
      dataPayload.codigoOperacion = refFinal;
    }

    pagarMutation.mutate({
      id: reserva.id,
      data: dataPayload,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Completar Pago de Reserva"
      size="md"
    >
      <form onSubmit={handlePagar} className="space-y-4">
        {/* Resumen del Monto y Reserva */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Reserva #{reserva.id}</span>
            <StatusBadge status={reserva.estado || 'PENDIENTE'} />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="font-bold text-slate-900 block text-sm">
                {reserva.canchaNombre || `Cancha #${reserva.canchaId}`}
              </span>
              <span className="text-xs text-slate-500">Reserva CanchaYa</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total a Pagar</span>
              <span className="text-2xl font-black text-turf-700 font-display">
                S/. {Number(reserva.precioTotal || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {reserva.fecha}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {reserva.horaInicio} - {reserva.horaFin}
            </span>
          </div>
        </div>

        {/* Métodos de Pago Simulados */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Selecciona método de pago (Simulado):
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMetodoPago('BILLETERA')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition ${
                metodoPago === 'BILLETERA'
                  ? 'border-turf-600 bg-turf-50/70 text-turf-900 ring-2 ring-turf-500/50'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-4 h-4 text-turf-600" />
              <span>Yape / Plin</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoPago('TARJETA')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition ${
                metodoPago === 'TARJETA'
                  ? 'border-turf-600 bg-turf-50/70 text-turf-900 ring-2 ring-turf-500/50'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-turf-600" />
              <span>Tarjeta Débito/Crédito</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoPago('TRANSFERENCIA')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition ${
                metodoPago === 'TRANSFERENCIA'
                  ? 'border-turf-600 bg-turf-50/70 text-turf-900 ring-2 ring-turf-500/50'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Landmark className="w-4 h-4 text-turf-600" />
              <span>Transferencia BCP/BBVA</span>
            </button>

            <button
              type="button"
              onClick={() => setMetodoPago('EFECTIVO')}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition ${
                metodoPago === 'EFECTIVO'
                  ? 'border-turf-600 bg-turf-50/70 text-turf-900 ring-2 ring-turf-500/50'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Banknote className="w-4 h-4 text-turf-600" />
              <span>Pago en Recepción</span>
            </button>
          </div>
        </div>

        {/* Campo Referencia */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 block">
            N° de Operación o Referencia (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: 984712 o dejar vacío para autogenerar"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-turf-500"
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-turf-600 shrink-0" />
          <span>Pasarela simulada con confirmación instantánea conectada al backend.</span>
        </div>

        {errorPago && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorPago}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            disabled={pagarMutation.isPending}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {pagarMutation.isPending ? 'Confirmando Pago...' : `Pagar S/. ${Number(reserva.precioTotal || 0).toFixed(2)}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
