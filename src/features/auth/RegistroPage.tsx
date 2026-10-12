import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useRegistrar1 } from '@/api/endpoints';
import { getApiErrorMessage } from '@/lib/error-utils';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import type { UsuarioAutenticado, RolUsuario } from '@/types/auth';
import { UserPlus, User, Mail, Lock, Phone, Trophy, Loader2 } from 'lucide-react';

const registroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100),
  apellido: z.string().min(1, 'El apellido es obligatorio').max(100),
  correo: z.string().min(1, 'El correo es obligatorio').email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  telefono: z.string().max(20).optional().or(z.literal('')),
  apodo: z.string().max(50).optional().or(z.literal('')),
  posicionPreferida: z.string().max(50).optional().or(z.literal('')),
});

type RegistroFormData = z.infer<typeof registroSchema>;

export const RegistroPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      telefono: '',
      apodo: '',
      posicionPreferida: '',
    },
  });

  const registroMutation = useRegistrar1({
    mutation: {
      onSuccess: (data) => {
        if (data.token && data.usuario) {
          const usuarioAutenticado: UsuarioAutenticado = {
            id: data.usuario.id ?? 0,
            nombre: data.usuario.nombre ?? '',
            apellido: data.usuario.apellido ?? '',
            correo: data.usuario.correo ?? '',
            telefono: data.usuario.telefono,
            rol: (data.usuario.rol as RolUsuario) || 'JUGADOR',
            apodo: data.usuario.apodo,
            fotoUrl: data.usuario.fotoUrl,
            posicionPreferida: data.usuario.posicionPreferida,
          };
          login(data.token, usuarioAutenticado);
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      },
      onError: (err) => {
        setErrorMensaje(getApiErrorMessage(err, 'No fue posible completar el registro. Intenta con otro correo.'));
      },
    },
  });

  const onSubmit = (formData: RegistroFormData) => {
    setErrorMensaje(null);
    registroMutation.mutate({
      data: {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        password: formData.password,
        telefono: formData.telefono || undefined,
        apodo: formData.apodo || undefined,
        posicionPreferida: formData.posicionPreferida || undefined,
      },
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear Cuenta de Jugador</h1>
          <p className="mt-1 text-sm text-slate-500">
            Regístrate para reservar canchas y registrar tus estadísticas
          </p>
        </div>

        {errorMensaje && (
          <div className="mb-6">
            <ErrorMessage mensaje={errorMensaje} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">
                Nombre
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="nombre"
                  type="text"
                  disabled={registroMutation.isPending}
                  placeholder="Lionel"
                  aria-invalid={errors.nombre ? 'true' : 'false'}
                  aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                  className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.nombre ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  {...register('nombre')}
                />
              </div>
              {errors.nombre && (
                <p id="nombre-error" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-slate-700 mb-1">
                Apellido
              </label>
              <input
                id="apellido"
                type="text"
                disabled={registroMutation.isPending}
                placeholder="Messi"
                aria-invalid={errors.apellido ? 'true' : 'false'}
                aria-describedby={errors.apellido ? 'apellido-error' : undefined}
                className={`block w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.apellido ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                {...register('apellido')}
              />
              {errors.apellido && (
                <p id="apellido-error" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.apellido.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="reg-correo" className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-correo"
                type="email"
                disabled={registroMutation.isPending}
                placeholder="jugador@ejemplo.com"
                aria-invalid={errors.correo ? 'true' : 'false'}
                aria-describedby={errors.correo ? 'correo-reg-error' : undefined}
                className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.correo ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                {...register('correo')}
              />
            </div>
            {errors.correo && (
              <p id="correo-reg-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.correo.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="reg-password"
                type="password"
                disabled={registroMutation.isPending}
                placeholder="Mínimo 6 caracteres"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-reg-error' : undefined}
                className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-slate-300'
                }`}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p id="password-reg-error" role="alert" className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono (opcional)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="telefono"
                  type="tel"
                  disabled={registroMutation.isPending}
                  placeholder="+51 987654321"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  {...register('telefono')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="apodo" className="block text-sm font-medium text-slate-700 mb-1">
                Apodo deportivo (opcional)
              </label>
              <input
                id="apodo"
                type="text"
                disabled={registroMutation.isPending}
                placeholder="La Pulga"
                className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                {...register('apodo')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="posicion" className="block text-sm font-medium text-slate-700 mb-1">
              Posición preferida (opcional)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Trophy className="w-4 h-4" />
              </div>
              <select
                id="posicion"
                disabled={registroMutation.isPending}
                className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                {...register('posicionPreferida')}
              >
                <option value="">Selecciona una posición</option>
                <option value="Delantero">Delantero</option>
                <option value="Mediocampista">Mediocampista</option>
                <option value="Defensa">Defensa</option>
                <option value="Arquero">Arquero</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={registroMutation.isPending}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {registroMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 border-t border-slate-100 pt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
