import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCancelar } from '@/api/endpoints';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import { formatearHora } from '@/features/canchas/utils/tarifa';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  AlertTriangle,
  X,
  Loader2,
  Clock,
  ShieldAlert,
} from 'lucide-react';

const cancelarSchema = z.object({
  motivo: z
    .string()
    .min(5, 'Ingresa un motivo descriptivo de al menos 5 caracteres')
    .max(255, 'El motivo no debe exceder los 255 caracteres'),
});

type CancelarFormData = z.infer<typeof cancelarSchema>;

interface CancelarModalProps {
  reserva: ReservaResponse;
  onClose: () => void;
  onSuccess: (reservaActualizada: ReservaResponse) => void;
}

export const CancelarModal: React.FC<CancelarModalProps> = ({
  reserva,
  onClose,
  onSuccess,
}) => {
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelarFormData>({
    resolver: zodResolver(cancelarSchema),
    defaultValues: {
      motivo: '',
    },
  });

  const cancelarMutation = useCancelar({
    mutation: {
      onSuccess: (data) => {
        onSuccess(data);
      },
      onError: (err) => {
        setErrorMensaje(
          getApiErrorMessage(
            err,
            'No se pudo cancelar la reserva. Recuerda la regla de las 2 horas.'
          )
        );
      },
    },
  });

  const onSubmit = (formData: CancelarFormData) => {
    if (!reserva.id) return;
    setErrorMensaje(null);

    cancelarMutation.mutate({
      id: reserva.id,
      data: {
        motivo: formData.motivo,
      },
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cancelar-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-50/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 id="modal-cancelar-title" className="text-base font-bold text-red-950">
              Cancelar Reserva
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de cancelación"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-600 flex justify-between items-center">
          <div>
            <span className="font-bold text-slate-800">
              {reserva.canchaNombre || 'Cancha'}
            </span>
            <p className="text-slate-500">
              {reserva.fecha} · {formatearHora(reserva.horaInicio)} - {formatearHora(reserva.horaFin)}
            </p>
          </div>
          <span className="font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border">
            {reserva.codigo}
          </span>
        </div>

        {/* Aviso explícito de la regla de 2 horas */}
        <div className="p-4 mx-6 mt-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Regla de Cancelación (2 Horas de Anticipación)</span>
          </div>
          <p className="leading-relaxed">
            Las reservas solo pueden cancelarse con al menos <strong>2 horas de anticipación</strong> a la hora de inicio del turno. Pasado ese tiempo, la política de la sede no admite cancelaciones directas.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMensaje && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMensaje}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Motivo de la cancelación <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Indica el motivo por el cual necesitas cancelar tu turno..."
              {...register('motivo')}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.motivo && (
              <p className="text-[11px] text-red-600 mt-1">{errors.motivo.message}</p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={cancelarMutation.isPending}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              Mantener reserva
            </button>
            <button
              type="submit"
              disabled={cancelarMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {cancelarMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Cancelando...</span>
                </>
              ) : (
                <span>Confirmar cancelación</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
