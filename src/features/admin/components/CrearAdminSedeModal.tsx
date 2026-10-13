import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCrearAdministradorSede,
  useActualizarAdministradorSede,
  type AdministradorSedeResponse,
  type CrearAdminSedeRequest,
  type ActualizarAdminSedeRequest,
} from '../adminUsuariosApi';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  UserCheck,
  UserCog,
  X,
  Loader2,
  Mail,
  Lock,
  Phone,
  User,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

const buildAdminSedeSchema = (isEdit: boolean) =>
  z.object({
    nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres'),
    correo: z.string().trim().email('Ingresa un correo electrónico válido'),
    password: isEdit
      ? z
          .string()
          .refine((val) => !val || val.trim().length >= 6, {
            message: 'La contraseña debe tener al menos 6 caracteres si se desea modificar',
          })
          .optional()
      : z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    telefono: z.string().trim().min(6, 'Ingresa un teléfono de contacto válido'),
    activo: z.boolean().optional(),
  });

type AdminSedeFormData = {
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
  telefono: string;
  activo?: boolean;
};

interface CrearAdminSedeModalProps {
  onClose: () => void;
  onSuccess: (admin: AdministradorSedeResponse) => void;
  adminAEditar?: AdministradorSedeResponse | null;
}

export const CrearAdminSedeModal: React.FC<CrearAdminSedeModalProps> = ({
  onClose,
  onSuccess,
  adminAEditar,
}) => {
  const isEdit = Boolean(adminAEditar);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminSedeFormData>({
    resolver: zodResolver(buildAdminSedeSchema(isEdit)),
    defaultValues: {
      nombre: adminAEditar?.nombre || '',
      apellido: adminAEditar?.apellido || '',
      correo: adminAEditar?.correo || '',
      password: '',
      telefono: adminAEditar?.telefono || '',
      activo: adminAEditar ? adminAEditar.activo : true,
    },
  });

  const crearMutation = useCrearAdministradorSede({
    onSuccess: (data) => {
      onSuccess(data);
    },
    onError: (err) => {
      setErrorMensaje(
        getApiErrorMessage(
          err,
          'No se pudo registrar el Administrador de Sede. Verifica que el correo no esté en uso.'
        )
      );
    },
  });

  const actualizarMutation = useActualizarAdministradorSede({
    onSuccess: (data) => {
      onSuccess(data);
    },
    onError: (err) => {
      setErrorMensaje(
        getApiErrorMessage(
          err,
          'No se pudo actualizar el Administrador de Sede. Verifica que el correo no esté en uso.'
        )
      );
    },
  });

  const isSubmitting = crearMutation.isPending || actualizarMutation.isPending;

  const onSubmit = (formData: AdminSedeFormData) => {
    setErrorMensaje(null);
    if (isEdit && adminAEditar) {
      const payload: ActualizarAdminSedeRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password && formData.password.trim() ? formData.password.trim() : undefined,
        activo: formData.activo ?? true,
      };
      actualizarMutation.mutate({ id: adminAEditar.id, data: payload });
    } else {
      const payload: CrearAdminSedeRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim(),
        password: formData.password || '',
        telefono: formData.telefono.trim(),
      };
      crearMutation.mutate(payload);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              {isEdit ? <UserCog className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEdit ? 'Editar Administrador de Sede' : 'Nuevo Administrador de Sede'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? 'Modifica los datos personales, contacto, estado o contraseña de acceso.'
                  : 'Crea una cuenta con permisos para gestionar sedes y canchas.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error si ocurre */}
        {errorMensaje && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p>{errorMensaje}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nombre</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Juan"
                {...register('nombre')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              {errors.nombre && (
                <p className="text-[11px] text-red-600">{errors.nombre.message}</p>
              )}
            </div>

            {/* Apellido */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Apellido</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Pérez"
                {...register('apellido')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              {errors.apellido && (
                <p className="text-[11px] text-red-600">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          {/* Correo */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Correo Electrónico (Login)</span>
            </label>
            <input
              type="email"
              placeholder="admin.norte@canchas.com"
              {...register('correo')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
            {errors.correo && (
              <p className="text-[11px] text-red-600">{errors.correo.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contraseña */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEdit ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</span>
              </label>
              <input
                type="password"
                placeholder={isEdit ? 'Dejar en blanco para mantenerla' : 'Mínimo 6 caracteres'}
                {...register('password')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              {errors.password && (
                <p className="text-[11px] text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Teléfono */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Teléfono</span>
              </label>
              <input
                type="tel"
                placeholder="987654321"
                {...register('telefono')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
              {errors.telefono && (
                <p className="text-[11px] text-red-600">{errors.telefono.message}</p>
              )}
            </div>
          </div>

          {/* Estado de la cuenta (solo en edición) */}
          {isEdit && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <input
                type="checkbox"
                id="activo"
                {...register('activo')}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
              />
              <label htmlFor="activo" className="text-xs font-semibold text-slate-700 cursor-pointer">
                Cuenta de usuario activa (permite iniciar sesión y operar)
              </label>
            </div>
          )}

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
            <span className="font-bold">Rol: ADMINISTRADOR DE SEDE (ADMIN_SEDE)</span>
            <p className="text-purple-700 text-[11px] leading-relaxed">
              Este usuario podrá iniciar sesión en la plataforma, crear sedes a su nombre, gestionar canchas, bloquear horarios de mantenimiento y ver reservas.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : isEdit ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Crear Administrador</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
