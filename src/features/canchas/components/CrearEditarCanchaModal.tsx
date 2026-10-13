import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCrear3, useActualizar1 } from '@/api/endpoints';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import type { SedeResponse } from '@/api/model/sedeResponse';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Grid,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

const canchaSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  sedeId: z.coerce.number().min(1, 'Debes seleccionar una sede'),
  tipoDeporte: z.enum(['FUTBOL', 'BASQUET', 'VOLEY', 'PADEL']),
  superficie: z.enum([
    'CESPED_SINTETICO',
    'CESPED_NATURAL',
    'PARQUET',
    'CEMENTO',
    'ARENA',
    'CRISTAL_SINTETICO',
  ]),
  techada: z.boolean().default(false),
  iluminacion: z.boolean().default(true),
  activa: z.boolean().default(true),
  formato: z.enum(['FUTBOL_5', 'FUTBOL_7', 'FUTBOL_11']).optional(),
  medioCampo: z.boolean().optional(),
  alturaRed: z.coerce.number().optional(),
  esDePlaya: z.boolean().optional(),
  paredesDeVidrio: z.boolean().optional(),
  tipoTarifa: z.enum(['ESTANDAR', 'HORA_PICO', 'PROMOCIONAL']).default('ESTANDAR'),
  precioHora: z.coerce.number().min(1, 'El precio debe ser mayor a 0'),
  precioNormal: z.coerce.number().optional(),
  precioPico: z.coerce.number().optional(),
  inicioPico: z.string().optional(),
  finPico: z.string().optional(),
});

type CanchaFormData = z.infer<typeof canchaSchema>;

interface CrearEditarCanchaModalProps {
  canchaAEditar?: CanchaResponse | null;
  sedesDisponibles: SedeResponse[];
  sedeSeleccionadaId?: number;
  onClose: () => void;
  onSuccess: (cancha: CanchaResponse) => void;
}

export const CrearEditarCanchaModal: React.FC<CrearEditarCanchaModalProps> = ({
  canchaAEditar,
  sedesDisponibles,
  sedeSeleccionadaId,
  onClose,
  onSuccess,
}) => {
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const esEdicion = Boolean(canchaAEditar && canchaAEditar.id);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CanchaFormData>({
    resolver: zodResolver(canchaSchema),
    defaultValues: {
      nombre: canchaAEditar?.nombre || '',
      sedeId: canchaAEditar?.sedeId || sedeSeleccionadaId || (sedesDisponibles[0]?.id ?? 1),
      tipoDeporte: (canchaAEditar?.deporte as any) || 'FUTBOL',
      superficie: (canchaAEditar?.superficie as any) || 'CESPED_SINTETICO',
      techada: canchaAEditar?.techada ?? false,
      iluminacion: canchaAEditar?.iluminacion ?? true,
      activa: canchaAEditar?.activa ?? true,
      formato: 'FUTBOL_7',
      medioCampo: false,
      alturaRed: 2.43,
      esDePlaya: false,
      paredesDeVidrio: true,
      tipoTarifa: 'ESTANDAR',
      precioHora: canchaAEditar?.precioHora || canchaAEditar?.precioNormal || 80,
    },
  });

  const deporteSeleccionado = watch('tipoDeporte');
  const tipoTarifaSeleccionada = watch('tipoTarifa');

  const crearMutation = useCrear3({
    mutation: {
      onSuccess: (data) => {
        onSuccess(data);
      },
      onError: (err) => {
        setErrorMensaje(
          getApiErrorMessage(err, 'No se pudo crear la cancha. Verifica los datos ingresados.')
        );
      },
    },
  });

  const actualizarMutation = useActualizar1({
    mutation: {
      onSuccess: (data) => {
        onSuccess(data);
      },
      onError: (err) => {
        setErrorMensaje(
          getApiErrorMessage(err, 'No se pudo actualizar la cancha. Verifica los datos ingresados.')
        );
      },
    },
  });

  const isPending = crearMutation.isPending || actualizarMutation.isPending;

  const normalizarHora = (h?: string): string | undefined => {
    if (!h) return undefined;
    const p = h.trim().split(':');
    const hh = p[0].padStart(2, '0');
    const mm = (p[1] || '00').padStart(2, '0');
    const ss = (p[2] || '00').padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const onSubmit = (formData: CanchaFormData) => {
    setErrorMensaje(null);

    const payload: any = {
      nombre: formData.nombre.trim(),
      sedeId: formData.sedeId,
      tipoDeporte: formData.tipoDeporte,
      superficie: formData.superficie,
      techada: formData.techada,
      iluminacion: formData.iluminacion,
      activa: formData.activa,
      tipoTarifa: formData.tipoTarifa,
      precioHora: formData.precioHora,
    };

    if (formData.tipoDeporte === 'FUTBOL') {
      payload.formato = formData.formato || 'FUTBOL_7';
    } else if (formData.tipoDeporte === 'BASQUET') {
      payload.medioCampo = Boolean(formData.medioCampo);
    } else if (formData.tipoDeporte === 'VOLEY') {
      payload.alturaRed = formData.alturaRed || 2.43;
      payload.esDePlaya = Boolean(formData.esDePlaya);
    } else if (formData.tipoDeporte === 'PADEL') {
      payload.paredesDeVidrio = Boolean(formData.paredesDeVidrio);
    }

    if (formData.tipoTarifa === 'HORA_PICO') {
      payload.precioNormal = formData.precioNormal || formData.precioHora;
      payload.precioPico = formData.precioPico || (formData.precioHora * 1.3);
      payload.inicioPico = normalizarHora(formData.inicioPico) || '18:00:00';
      payload.finPico = normalizarHora(formData.finPico) || '23:00:00';
    }

    if (esEdicion && canchaAEditar?.id) {
      actualizarMutation.mutate({
        id: canchaAEditar.id,
        data: payload,
      });
    } else {
      crearMutation.mutate({
        data: payload,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cancha-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-emerald-700" />
            <h2 id="modal-cancha-title" className="text-base font-bold text-slate-800">
              {esEdicion ? 'Editar Cancha Deportiva' : 'Nueva Cancha Deportiva'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMensaje && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMensaje}</span>
            </div>
          )}

          {/* Sede Asignada */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Sede a la que pertenece <span className="text-red-500">*</span>
            </label>
            <select
              {...register('sedeId')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {sedesDisponibles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.distrito})
                </option>
              ))}
            </select>
            {errors.sedeId && (
              <p className="text-[11px] text-red-600 mt-1">{errors.sedeId.message}</p>
            )}
          </div>

          {/* Nombre de la Cancha */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nombre de la cancha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Cancha Sintética 1"
              {...register('nombre')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.nombre && (
              <p className="text-[11px] text-red-600 mt-1">{errors.nombre.message}</p>
            )}
          </div>

          {/* Deporte y Superficie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Deporte <span className="text-red-500">*</span>
              </label>
              <select
                {...register('tipoDeporte')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="FUTBOL">Fútbol</option>
                <option value="BASQUET">Básquetbol</option>
                <option value="VOLEY">Vóleibol</option>
                <option value="PADEL">Pádel</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tipo de Superficie <span className="text-red-500">*</span>
              </label>
              <select
                {...register('superficie')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CESPED_SINTETICO">Césped Sintético</option>
                <option value="CESPED_NATURAL">Césped Natural</option>
                <option value="PARQUET">Parquet / Madera</option>
                <option value="CEMENTO">Cemento / Concreto</option>
                <option value="ARENA">Arena</option>
                <option value="CRISTAL_SINTETICO">Cristal / Césped Pro</option>
              </select>
            </div>
          </div>

          {/* Opciones específicas según deporte */}
          {deporteSeleccionado === 'FUTBOL' && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Formato de Fútbol
              </label>
              <select
                {...register('formato')}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="FUTBOL_5">Fútbol 5 (Cancha rápida)</option>
                <option value="FUTBOL_7">Fútbol 7 (Recomendado)</option>
                <option value="FUTBOL_11">Fútbol 11 (Reglamentario)</option>
              </select>
            </div>
          )}

          {/* Tarifa y Precio */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Configuración de Precios</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estrategia Tarifaria
                </label>
                <select
                  {...register('tipoTarifa')}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ESTANDAR">Precio Fijo Estándar</option>
                  <option value="HORA_PICO">Tarifa Hora Pico</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Precio Base / Hora (S/.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="80.00"
                  {...register('precioHora')}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.precioHora && (
                  <p className="text-[11px] text-red-600 mt-1">{errors.precioHora.message}</p>
                )}
              </div>
            </div>

            {tipoTarifaSeleccionada === 'HORA_PICO' && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">
                    Inicio Hora Pico
                  </label>
                  <input
                    type="time"
                    defaultValue="18:00"
                    {...register('inicioPico')}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-600 block mb-1">
                    Fin Hora Pico
                  </label>
                  <input
                    type="time"
                    defaultValue="23:00"
                    {...register('finPico')}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Características adicionales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                {...register('techada')}
                className="w-3.5 h-3.5 text-emerald-600 rounded"
              />
              <span>Techada</span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                {...register('iluminacion')}
                className="w-3.5 h-3.5 text-emerald-600 rounded"
              />
              <span>Iluminación</span>
            </label>
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                {...register('activa')}
                className="w-3.5 h-3.5 text-emerald-600 rounded"
              />
              <span>Activa</span>
            </label>
          </div>

          {/* Botones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{esEdicion ? 'Guardar Cambios' : 'Crear Cancha'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
