import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePagar } from '@/api/endpoints';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import { PagoRequestTipoPago } from '@/api/model/pagoRequestTipoPago';
import { formatearPrecio, formatearHora } from '@/features/canchas/utils/tarifa';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const pagoSchema = z
  .object({
    tipoPago: z.enum(['TARJETA', 'BILLETERA', 'TRANSFERENCIA', 'EFECTIVO']),
    monto: z.number().positive('El monto debe ser mayor a 0'),
    referencia: z.string().optional(),
    // Tarjeta
    marca: z.string().optional(),
    ultimosCuatro: z.string().optional(),
    // Billetera
    proveedor: z.string().optional(),
    numeroOperacion: z.string().optional(),
    // Transferencia
    banco: z.string().optional(),
    codigoOperacion: z.string().optional(),
    // Efectivo
    recibidoPor: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipoPago === 'TARJETA') {
      if (!data.ultimosCuatro || !/^\d{4}$/.test(data.ultimosCuatro)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ultimosCuatro'],
          message: 'Ingresa exactamente los últimos 4 dígitos numéricos',
        });
      }
      if (!data.marca || data.marca.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['marca'],
          message: 'Ingresa la marca de la tarjeta (Visa, Mastercard, etc.)',
        });
      }
    }

    if (data.tipoPago === 'BILLETERA') {
      if (!data.proveedor || data.proveedor.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['proveedor'],
          message: 'Ingresa el proveedor (Yape, Plin, etc.)',
        });
      }
    }

    if (data.tipoPago === 'TRANSFERENCIA') {
      if (!data.banco || data.banco.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['banco'],
          message: 'Ingresa el nombre del banco',
        });
      }
    }

    if (data.tipoPago === 'EFECTIVO') {
      if (!data.recibidoPor || data.recibidoPor.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['recibidoPor'],
          message: 'Ingresa el nombre de la persona que recibe el efectivo',
        });
      }
    }
  });

type PagoFormData = z.infer<typeof pagoSchema>;

interface PagoModalProps {
  reserva: ReservaResponse;
  onClose: () => void;
  onSuccess: (reservaActualizada: ReservaResponse) => void;
}

export const PagoModal: React.FC<PagoModalProps> = ({
  reserva,
  onClose,
  onSuccess,
}) => {
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [pagoCompletado, setPagoCompletado] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      tipoPago: 'TARJETA',
      monto: reserva.precioTotal ?? 0,
      referencia: `PAGO-${reserva.codigo || reserva.id}`,
      marca: 'Visa',
      ultimosCuatro: '',
      proveedor: 'Yape',
      numeroOperacion: '',
      banco: 'BCP',
      codigoOperacion: '',
      recibidoPor: 'Recepción Central',
    },
  });

  const tipoPagoSeleccionado = watch('tipoPago');

  const pagarMutation = usePagar({
    mutation: {
      onSuccess: (data) => {
        setPagoCompletado(true);
        setTimeout(() => {
          onSuccess(data);
        }, 1200);
      },
      onError: (err) => {
        setErrorMensaje(getApiErrorMessage(err, 'Error al procesar el pago'));
      },
    },
  });

  const onSubmit = (formData: PagoFormData) => {
    if (!reserva.id) return;
    setErrorMensaje(null);

    pagarMutation.mutate({
      id: reserva.id,
      data: {
        tipoPago: formData.tipoPago as PagoRequestTipoPago,
        monto: formData.monto,
        referencia: formData.referencia,
        marca: formData.tipoPago === 'TARJETA' ? formData.marca : undefined,
        ultimosCuatro:
          formData.tipoPago === 'TARJETA' ? formData.ultimosCuatro : undefined,
        proveedor:
          formData.tipoPago === 'BILLETERA' ? formData.proveedor : undefined,
        numeroOperacion:
          formData.tipoPago === 'BILLETERA'
            ? formData.numeroOperacion
            : undefined,
        banco:
          formData.tipoPago === 'TRANSFERENCIA' ? formData.banco : undefined,
        codigoOperacion:
          formData.tipoPago === 'TRANSFERENCIA'
            ? formData.codigoOperacion
            : undefined,
        recibidoPor:
          formData.tipoPago === 'EFECTIVO' ? formData.recibidoPor : undefined,
      },
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pago-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 id="modal-pago-title" className="text-lg font-bold text-slate-800">
              Pagar Reserva
            </h2>
            <p className="text-xs text-slate-500">
              Código: <span className="font-semibold">{reserva.codigo || `#${reserva.id}`}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de pago"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen de Reserva */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs sm:text-sm">
          <div>
            <p className="font-semibold text-emerald-950">
              {reserva.canchaNombre || 'Cancha'}
            </p>
            <p className="text-emerald-800 text-xs">
              {reserva.fecha} · {formatearHora(reserva.horaInicio)} - {formatearHora(reserva.horaFin)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-emerald-800">Total a pagar</span>
            <div className="text-base font-extrabold text-emerald-950">
              {formatearPrecio(reserva.precioTotal)}
            </div>
          </div>
        </div>

        {pagoCompletado ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              ¡Pago procesado con éxito!
            </h3>
            <p className="text-sm text-slate-600">
              Tu reserva ha sido confirmada correctamente.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {errorMensaje && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMensaje}</span>
              </div>
            )}

            {/* Selector de Método de Pago */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                Método de pago
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('tipoPago', 'TARJETA')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                    tipoPagoSeleccionado === 'TARJETA'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1 text-emerald-600" />
                  <span>Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('tipoPago', 'BILLETERA')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                    tipoPagoSeleccionado === 'BILLETERA'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1 text-emerald-600" />
                  <span>Billetera</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('tipoPago', 'TRANSFERENCIA')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                    tipoPagoSeleccionado === 'TRANSFERENCIA'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Landmark className="w-5 h-5 mb-1 text-emerald-600" />
                  <span>Transferencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue('tipoPago', 'EFECTIVO')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
                    tipoPagoSeleccionado === 'EFECTIVO'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                  <span>Efectivo</span>
                </button>
              </div>
            </div>

            {/* Campos condicionales según tipoPago */}
            {tipoPagoSeleccionado === 'TARJETA' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Marca de tarjeta
                  </label>
                  <select
                    {...register('marca')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Últimos 4 dígitos
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="4242"
                    {...register('ultimosCuatro')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.ultimosCuatro && (
                    <p className="text-[11px] text-red-600 mt-1">
                      {errors.ultimosCuatro.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {tipoPagoSeleccionado === 'BILLETERA' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Proveedor
                  </label>
                  <select
                    {...register('proveedor')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                    <option value="Agora">Agora</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    N° de Operación
                  </label>
                  <input
                    type="text"
                    placeholder="OP-987654"
                    {...register('numeroOperacion')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {tipoPagoSeleccionado === 'TRANSFERENCIA' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Banco
                  </label>
                  <select
                    {...register('banco')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BCP">BCP</option>
                    <option value="BBVA">BBVA</option>
                    <option value="Interbank">Interbank</option>
                    <option value="Scotiabank">Scotiabank</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Código de Operación
                  </label>
                  <input
                    type="text"
                    placeholder="TR-543210"
                    {...register('codigoOperacion')}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {tipoPagoSeleccionado === 'EFECTIVO' && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Recibido por (Personal de sede)
                </label>
                <input
                  type="text"
                  placeholder="Nombre de recepcionista"
                  {...register('recibidoPor')}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.recibidoPor && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {errors.recibidoPor.message}
                  </p>
                )}
              </div>
            )}

            {/* Referencia opcional */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Referencia o nota de pago (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Pago con tarjeta de débito"
                {...register('referencia')}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Acciones */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={pagarMutation.isPending}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pagarMutation.isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {pagarMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Procesando pago...</span>
                  </>
                ) : (
                  <span>Confirmar pago de {formatearPrecio(reserva.precioTotal)}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
