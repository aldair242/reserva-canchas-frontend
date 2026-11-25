import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLogin } from '@/api/endpoints';
import { getApiErrorMessage } from '@/lib/error-utils';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import type { UsuarioAutenticado, RolUsuario } from '@/types/auth';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Activity,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

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

  const [mostrarPassword, setMostrarPassword] = useState(false);
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
        correo: formData.correo.trim(),
        password: formData.password,
      },
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-navy-200/80 shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Columna 1: Imagen y Propuesta Deportiva (Azul noche / Verde césped) */}
        <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-turf-950 text-white p-8 sm:p-10 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <BrandLogo isDark={true} />
            <div className="pt-8 space-y-3">
              <span className="text-[11px] font-bold text-limeAccent-400 uppercase tracking-widest block font-mono">
                Portal Oficial
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-snug">
                El control de tus partidos en un solo lugar.
              </h2>
              <p className="text-xs text-navy-200 leading-relaxed">
                Reserva turnos en segundos, monitorea tus partidos en vivo con sensores de meta y revive tus mejores goles en video.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-navy-800 text-xs text-navy-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-turf-400" />
              <span>Bloqueo pesimista sin conflictos de horario</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-limeAccent-400" />
              <span>Detección de goles por sensores IoT</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Sincronización en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Columna 2: Formulario de Autenticación */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-navy-950 tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-navy-500 mt-1">
              Ingresa tu correo y contraseña para acceder a la plataforma.
            </p>
          </div>

          {errorMensaje && (
            <div className="mb-5">
              <ErrorMessage mensaje={errorMensaje} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Campo Correo */}
            <div className="space-y-1.5">
              <label htmlFor="correo" className="block text-xs font-semibold text-navy-700">
                Correo electrónico
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  disabled={loginMutation.isPending}
                  placeholder="ejemplo@correo.com"
                  className={`w-full rounded-xl border text-sm py-2.5 pl-10 pr-3.5 bg-white text-navy-900 transition-colors focus:outline-none focus:ring-1 ${
                    errors.correo
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-navy-200 focus:border-turf-600 focus:ring-turf-600'
                  }`}
                  {...register('correo')}
                />
              </div>
              {errors.correo && (
                <p role="alert" className="text-xs text-rose-600 font-medium">
                  {errors.correo.message}
                </p>
              )}
            </div>

            {/* Campo Contraseña con Mostrar/Ocultar */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-navy-700">
                Contraseña
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={loginMutation.isPending}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border text-sm py-2.5 pl-10 pr-10 bg-white text-navy-900 transition-colors focus:outline-none focus:ring-1 ${
                    errors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-navy-200 focus:border-turf-600 focus:ring-turf-600'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-navy-400 hover:text-navy-700 focus:outline-none"
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="text-xs text-rose-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-bold"
              isLoading={loginMutation.isPending}
            >
              Ingresar a CanchaYa
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-navy-500 border-t border-navy-100 pt-4">
            ¿Aún no tienes una cuenta?{' '}
            <Link to="/registro" className="font-bold text-turf-700 hover:underline">
              Crea tu cuenta de jugador
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
