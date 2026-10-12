import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLogin } from '@/api/endpoints';
import { getApiErrorMessage } from '@/lib/error-utils';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import type { UsuarioAutenticado, RolUsuario } from '@/types/auth';
import { LogIn, Lock, Mail, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: '',
      password: '',
    },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        if (!data.token || !data.usuario) {
          setErrorMensaje('La respuesta de autenticación es incompleta.');
          return;
        }

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

        const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
        navigate(from, { replace: true });
      },
      onError: (err) => {
        setErrorMensaje(getApiErrorMessage(err, 'No fue posible iniciar sesión. Verifica tus credenciales.'));
      },
    },
  });

  const onSubmit = (formData: LoginFormData) => {
    setErrorMensaje(null);
    loginMutation.mutate({
      data: {
        correo: formData.correo,
        password: formData.password,
      },
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Iniciar Sesión</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa a tu cuenta de Reserva de Canchas
          </p>
        </div>

        {errorMensaje && (
          <div className="mb-6">
            <ErrorMessage mensaje={errorMensaje} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="correo"
                type="email"
                autoComplete="email"
                disabled={loginMutation.isPending}
                placeholder="ejemplo@correo.com"
                aria-invalid={errors.correo ? 'true' : 'false'}
                aria-describedby={errors.correo ? 'correo-error' : undefined}
                className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.correo ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-300'
                }`}
                {...register('correo')}
              />
            </div>
            {errors.correo && (
              <p id="correo-error" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.correo.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
                placeholder="••••••••"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`block w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  errors.password ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-300'
                }`}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 border-t border-slate-100 pt-4">
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};
