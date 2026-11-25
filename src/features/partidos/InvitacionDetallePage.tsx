import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useObtenerResumen, useAgregarParticipante } from '@/api/endpoints';
import { useAuth } from '@/features/auth/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  CheckCircle2,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export const InvitacionDetallePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { usuario, estaAutenticado } = useAuth();

  const [equipoSeleccionado, setEquipoSeleccionado] = useState<'A' | 'B'>('A');
  const [unidoExitosamente, setUnidoExitosamente] = useState(false);
  const [errorUnirse, setErrorUnirse] = useState<string | null>(null);

  const {
    data: resumen,
    isLoading,
    isError,
    error,
    refetch,
  } = useObtenerResumen(token || '');

  const agregarParticipanteMutation = useAgregarParticipante({
    mutation: {
      onSuccess: () => {
        setUnidoExitosamente(true);
        setErrorUnirse(null);
      },
      onError: (err) => {
        setErrorUnirse(getApiErrorMessage(err, 'No se pudo unir al partido'));
      },
    },
  });

  const handleUnirse = () => {
    if (!resumen?.partidoId || !usuario?.id) return;
    setErrorUnirse(null);
    agregarParticipanteMutation.mutate({
      id: resumen.partidoId,
      data: {
        jugadorId: usuario.id,
        equipo: equipoSeleccionado,
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner mensaje="Cargando invitación del partido..." className="py-20" />;
  }

  if (isError || !resumen) {
    return (
      <div className="max-w-xl mx-auto py-12 space-y-4">
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'El enlace o token de invitación no es válido o ha expirado')}
          onReintentar={() => refetch()}
        />
        <div className="text-center">
          <Link
            to="/"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-800"
          >
            Volver a la página principal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Encabezado de Invitación */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-50 text-xs font-semibold backdrop-blur-sm">
          <Activity className="w-3.5 h-3.5" />
          Invitación Oficial a Partido
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          ¡Te han invitado a jugar un partido!
        </h1>
        <p className="text-sm sm:text-base text-emerald-100 max-w-lg mx-auto">
          Revisa los detalles del encuentro deportivo a continuación y únete a uno de los equipos.
        </p>
      </div>

      {/* Ficha del Partido */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* Enfrentamiento de Equipos */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Partido Programado
          </span>
          <div className="flex items-center justify-center gap-4 text-lg sm:text-xl font-black text-slate-800">
            <span className="text-emerald-700">{resumen.nombreEquipoA || 'Equipo A'}</span>
            <span className="text-slate-400 text-sm font-bold">VS</span>
            <span className="text-teal-700">{resumen.nombreEquipoB || 'Equipo B'}</span>
          </div>
          <div className="text-xs text-slate-500">
            Estado: <strong className="text-slate-700">{resumen.estado}</strong>
          </div>
        </div>

        {/* Datos de Lugar y Horario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block text-sm">
                {resumen.canchaNombre || 'Cancha Deportiva'}
              </span>
              <span className="text-slate-500">{resumen.sedeNombre || 'Sede'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <Calendar className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block text-sm">
                {resumen.fecha}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {resumen.horaInicio} a {resumen.horaFin}
              </span>
            </div>
          </div>
        </div>

        {/* Grabación y Sensores IoT */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Partido con Tecnología de Sensores y Grabación:</span>
            <p className="text-emerald-800 leading-relaxed">
              Tus goles y jugadas destacadas se detectan en tiempo real por sensores de arco y se recortan en video para que los revivas en tu perfil.
            </p>
          </div>
        </div>

        {/* Acciones según si está autenticado o no */}
        {estaAutenticado ? (
          <div className="pt-2 border-t border-slate-100 space-y-4">
            {unidoExitosamente ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm text-center space-y-2">
                <div className="flex items-center justify-center gap-2 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>¡Te has unido exitosamente al partido!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Ya estás registrado en la alineación del {equipoSeleccionado === 'A' ? (resumen.nombreEquipoA || 'Equipo A') : (resumen.nombreEquipoB || 'Equipo B')}.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/mis-partidos')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                  >
                    <span>Ir a Mis Partidos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Elige el equipo en el que vas a jugar:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEquipoSeleccionado('A')}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        equipoSeleccionado === 'A'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>{resumen.nombreEquipoA || 'Equipo A'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEquipoSeleccionado('B')}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        equipoSeleccionado === 'B'
                          ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-4 h-4 text-teal-600" />
                      <span>{resumen.nombreEquipoB || 'Equipo B'}</span>
                    </button>
                  </div>
                </div>

                {errorUnirse && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorUnirse}
                  </div>
                )}

                <button
                  type="button"
                  disabled={agregarParticipanteMutation.isPending}
                  onClick={handleUnirse}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trophy className="w-4 h-4" />
                  <span>
                    {agregarParticipanteMutation.isPending
                      ? 'Confirmando participación...'
                      : `Confirmar y Unirme al ${equipoSeleccionado === 'A' ? (resumen.nombreEquipoA || 'Equipo A') : (resumen.nombreEquipoB || 'Equipo B')}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="pt-4 border-t border-slate-100 space-y-3 text-center">
            <p className="text-xs text-slate-600 font-medium">
              Inicia sesión o regístrate para unirte a este partido con tu perfil de jugador y sumar tus estadísticas al ranking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </Link>
              <Link
                to="/registro"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrarme como Jugador</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

