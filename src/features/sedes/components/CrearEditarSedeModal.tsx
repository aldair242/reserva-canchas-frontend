import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCrear, useActualizar } from '@/api/endpoints';
import type { SedeResponse } from '@/api/model/sedeResponse';
import { getApiErrorMessage } from '@/lib/error-utils';
import { useAuth } from '@/features/auth/AuthContext';
import { useListarAdministradoresSede } from '@/features/admin/adminUsuariosApi';
import {
  Building2,
  X,
  Loader2,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  Users,
} from 'lucide-react';

const sedeSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  distrito: z.string().min(2, 'El distrito debe tener al menos 2 caracteres'),
  horaApertura: z.string().min(4, 'Ingresa una hora de apertura válida'),
  horaCierre: z.string().min(4, 'Ingresa una hora de cierre válida'),
  activa: z.boolean().default(true),
  latitud: z.string().optional(),
  longitud: z.string().optional(),
});

type SedeFormData = z.infer<typeof sedeSchema>;

interface CrearEditarSedeModalProps {
  sedeAEditar?: SedeResponse | null;
  onClose: () => void;
  onSuccess: (sede: SedeResponse) => void;
}

export const CrearEditarSedeModal: React.FC<CrearEditarSedeModalProps> = ({
  sedeAEditar,
  onClose,
  onSuccess,
}) => {
  const { rol } = useAuth();
  const { data: administradores = [] } = useListarAdministradoresSede();
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [adminSedeId, setAdminSedeId] = useState<string>(
    sedeAEditar?.administradorSedeId ? String(sedeAEditar.administradorSedeId) : ''
  );
  const esEdicion = Boolean(sedeAEditar && sedeAEditar.id);

  // Formatear HH:mm:ss a HH:mm para el input type="time"
  const limpiarHoraInput = (h?: string, defecto = '08:00') => {
    if (!h) return defecto;
    const partes = h.split(':');
    if (partes.length >= 2) return `${partes[0].padStart(2, '0')}:${partes[1].padStart(2, '0')}`;
    return defecto;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SedeFormData>({
    resolver: zodResolver(sedeSchema),
    defaultValues: {
      nombre: sedeAEditar?.nombre || '',
      direccion: sedeAEditar?.direccion || '',
      distrito: sedeAEditar?.distrito || '',
      horaApertura: limpiarHoraInput(sedeAEditar?.horaApertura, '08:00'),
      horaCierre: limpiarHoraInput(sedeAEditar?.horaCierre, '23:00'),
      activa: sedeAEditar?.activa ?? true,
      latitud: sedeAEditar?.latitud !== undefined && sedeAEditar?.latitud !== null ? String(sedeAEditar.latitud) : '',
      longitud: sedeAEditar?.longitud !== undefined && sedeAEditar?.longitud !== null ? String(sedeAEditar.longitud) : '',
    },
  });

  const crearMutation = useCrear({
    mutation: {
      onSuccess: (data) => {
        onSuccess(data);
      },
      onError: (err) => {
        setErrorMensaje(
          getApiErrorMessage(err, 'No se pudo crear la sede. Verifica los datos ingresados.')
        );
      },
    },
  });

  const actualizarMutation = useActualizar({
    mutation: {
      onSuccess: (data) => {
        onSuccess(data);
      },
      onError: (err) => {
        setErrorMensaje(
          getApiErrorMessage(err, 'No se pudo actualizar la sede. Verifica los datos ingresados.')
        );
      },
    },
  });

  const isPending = crearMutation.isPending || actualizarMutation.isPending;

  const normalizarHora = (h: string): string => {
    const p = h.trim().split(':');
    const hh = p[0].padStart(2, '0');
    const mm = (p[1] || '00').padStart(2, '0');
    const ss = (p[2] || '00').padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const onSubmit = (formData: SedeFormData) => {
    setErrorMensaje(null);

    const lat = formData.latitud ? parseFloat(formData.latitud) : undefined;
    const lng = formData.longitud ? parseFloat(formData.longitud) : undefined;

    const payload = {
      nombre: formData.nombre.trim(),
      direccion: formData.direccion.trim(),
      distrito: formData.distrito.trim(),
      horaApertura: normalizarHora(formData.horaApertura),
      horaCierre: normalizarHora(formData.horaCierre),
      activa: formData.activa,
      latitud: Number.isNaN(lat) ? undefined : lat,
      longitud: Number.isNaN(lng) ? undefined : lng,
      administradorSedeId: adminSedeId ? Number(adminSedeId) : undefined,
    };

    if (esEdicion && sedeAEditar?.id) {
      actualizarMutation.mutate({
        id: sedeAEditar.id,
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
      aria-labelledby="modal-sede-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h2 id="modal-sede-title" className="text-base font-bold text-slate-800">
              {esEdicion ? 'Editar Sede Deportiva' : 'Nueva Sede Deportiva'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {errorMensaje && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMensaje}</span>
            </div>
          )}

          {/* Nombre de la Sede */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Nombre de la sede <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Sede Central Miraflores"
              {...register('nombre')}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.nombre && (
              <p className="text-[11px] text-red-600 mt-1">{errors.nombre.message}</p>
            )}
          </div>

          {/* Dirección y Distrito */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Av. Benavides 1234"
                {...register('direccion')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.direccion && (
                <p className="text-[11px] text-red-600 mt-1">{errors.direccion.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Distrito / Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Miraflores"
                {...register('distrito')}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.distrito && (
                <p className="text-[11px] text-red-600 mt-1">{errors.distrito.message}</p>
              )}
            </div>
          </div>

          {/* Horario de Apertura y Cierre */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hora de Apertura</span>
              </label>
              <input
                type="time"
                {...register('horaApertura')}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.horaApertura && (
                <p className="text-[11px] text-red-600 mt-1">{errors.horaApertura.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hora de Cierre</span>
              </label>
              <input
                type="time"
                {...register('horaCierre')}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.horaCierre && (
                <p className="text-[11px] text-red-600 mt-1">{errors.horaCierre.message}</p>
              )}
            </div>
          </div>

          {/* Coordenadas GPS opcionales */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Latitud (opcional)</span>
              </label>
              <input
                type="text"
                placeholder="-12.1215"
                {...register('latitud')}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>Longitud (opcional)</span>
              </label>
              <input
                type="text"
                placeholder="-77.0298"
                {...register('longitud')}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Asignación de Administrador de Sede (solo para ADMIN General) */}
          {rol === 'ADMIN' && (
            <div className="space-y-1 pt-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Administrador de Sede Asignado (Opcional)</span>
              </label>
              <select
                value={adminSedeId}
                onChange={(e) => setAdminSedeId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Sin asignar (o asignar luego) --</option>
                {administradores.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.nombre} {admin.apellido} ({admin.correo})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                El administrador seleccionado tendrá control operativo sobre esta sede y sus canchas.
              </p>
            </div>
          )}

          {/* Estado de operatividad */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="activa-checkbox"
              {...register('activa')}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="activa-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Sede activa y en funcionamiento
            </label>
          </div>

          {/* Botones de acción */}
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
                  <span>{esEdicion ? 'Guardar Cambios' : 'Crear Sede'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

