import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useRegistrar1 } from '@/api/endpoints';
import { getApiErrorMessage } from '@/lib/error-utils';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import type { UsuarioAutenticado, RolUsuario } from '@/types/auth';
import {
  Eye,
  EyeOff,
  Trophy,
  Activity,
  CheckCircle2,
} from 'lucide-react';

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

  const [mostrarPassword, setMostrarPassword] = useState(false);
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
        setErrorMensaje(getApiErrorMessage(err, 'No fue posible registrar tu cuenta. El correo ya podría estar en uso.'));
      },
    },
  });

  const onSubmit = (formData: RegistroFormData) => {
    setErrorMensaje(null);
    registroMutation.mutate({
      data: {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        correo: formData.correo.trim(),
        password: formData.password,
        telefono: formData.telefono?.trim() || undefined,
        apodo: formData.apodo?.trim() || undefined,
        posicionPreferida: formData.posicionPreferida?.trim() || undefined,
      },
    });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-navy-200/80 shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Columna 1: Branding y Beneficios Deportivos */}
        <div className="relative bg-gradient-to-br from-navy-950 via-navy-900 to-turf-950 text-white p-8 sm:p-10 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <BrandLogo isDark={true} />
            <div className="pt-8 space-y-3">
              <span className="text-[11px] font-bold text-limeAccent-400 uppercase tracking-widest block font-mono">
                Únete a la Comunidad
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-snug">
                Crea tu perfil de jugador oficial.
              </h2>
              <p className="text-xs text-navy-200 leading-relaxed">
                Guarda tus estadísticas de goles, asistencias y victorias, participa en partidos con amigos y accede a repeticiones en video.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-navy-800 text-xs text-navy-300">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Aparece en la tabla de clasificación de goleadores</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-turf-400" />
              <span>Atribución oficial de tus goles con sensores IoT</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-limeAccent-400" />
              <span>Reclama tus partidos previos como invitado</span>
            </div>
          </div>
        </div>

        {/* Columna 2: Formulario de Registro */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl text-navy-950 tracking-tight">
              Crear Cuenta
            </h1>
            <p className="text-xs text-navy-500 mt-1">
              Completa tus datos para registrarte como jugador.
            </p>
          </div>

          {errorMensaje && (
            <div className="mb-4">
              <ErrorMessage mensaje={errorMensaje} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="nombre" className="block text-xs font-semibold text-navy-700">
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej. Lucas"
                  disabled={registroMutation.isPending}
                  className={`w-full rounded-xl border text-sm py-2 px-3 bg-white text-navy-900 focus:outline-none focus:ring-1 ${
                    errors.nombre ? 'border-rose-400' : 'border-navy-200 focus:border-turf-600'
                  }`}
                  {...register('nombre')}
                />
                {errors.nombre && <p className="text-[11px] text-rose-600">{errors.nombre.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="apellido" className="block text-xs font-semibold text-navy-700">
                  Apellido
                </label>
                <input
                  id="apellido"
                  type="text"
                  placeholder="Ej. Silva"
                  disabled={registroMutation.isPending}
                  className={`w-full rounded-xl border text-sm py-2 px-3 bg-white text-navy-900 focus:outline-none focus:ring-1 ${
                    errors.apellido ? 'border-rose-400' : 'border-navy-200 focus:border-turf-600'
                  }`}
                  {...register('apellido')}
                />
                {errors.apellido && <p className="text-[11px] text-rose-600">{errors.apellido.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="correo" className="block text-xs font-semibold text-navy-700">
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                placeholder="jugador@ejemplo.com"
                disabled={registroMutation.isPending}
                className={`w-full rounded-xl border text-sm py-2 px-3 bg-white text-navy-900 focus:outline-none focus:ring-1 ${
                  errors.correo ? 'border-rose-400' : 'border-navy-200 focus:border-turf-600'
                }`}
                {...register('correo')}
              />
              {errors.correo && <p className="text-[11px] text-rose-600">{errors.correo.message}</p>}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-xs font-semibold text-navy-700">
                Contraseña (mínimo 6 caracteres)
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={registroMutation.isPending}
                  className={`w-full rounded-xl border text-sm py-2 pl-3 pr-9 bg-white text-navy-900 focus:outline-none focus:ring-1 ${
                    errors.password ? 'border-rose-400' : 'border-navy-200 focus:border-turf-600'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-navy-400 hover:text-navy-700"
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-600">{errors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="apodo" className="block text-xs font-semibold text-navy-700">
                  Apodo / Alias (opcional)
                </label>
                <input
                  id="apodo"
                  type="text"
                  placeholder="Ej. El Rayo"
                  disabled={registroMutation.isPending}
                  className="w-full rounded-xl border border-navy-200 text-sm py-2 px-3 bg-white text-navy-900 focus:border-turf-600 focus:outline-none focus:ring-1"
                  {...register('apodo')}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="posicionPreferida" className="block text-xs font-semibold text-navy-700">
                  Posición (opcional)
                </label>
                <input
                  id="posicionPreferida"
                  type="text"
                  placeholder="Delantero, Medio..."
                  disabled={registroMutation.isPending}
                  className="w-full rounded-xl border border-navy-200 text-sm py-2 px-3 bg-white text-navy-900 focus:border-turf-600 focus:outline-none focus:ring-1"
                  {...register('posicionPreferida')}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2 font-bold"
              isLoading={registroMutation.isPending}
            >
              Completar Registro
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-navy-500 border-t border-navy-100 pt-3">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link to="/login" className="font-bold text-turf-700 hover:underline">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
