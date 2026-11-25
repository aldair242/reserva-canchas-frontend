import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useObtenerResumen, useUnirse, useReclamar } from '@/api/endpoints';
import { useAuth } from '@/features/auth/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { getApiErrorMessage } from '@/lib/error-utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  CheckCircle2,
  LogIn,
  ArrowRight,
  ShieldCheck,
  Activity,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const InvitacionDetallePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, estaAutenticado } = useAuth();

  const [equipoSeleccionado, setEquipoSeleccionado] = useState<'A' | 'B'>('A');
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [apellidoInvitado, setApellidoInvitado] = useState('');
  const [unidoExitosamente, setUnidoExitosamente] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [modoReclamo, setModoReclamo] = useState(false);
  const [reclamoExitoso, setReclamoExitoso] = useState(false);

  const {
    data: resumen,
    isLoading,
    isError,
    error,
    refetch,
  } = useObtenerResumen(token || '');

  // Hook oficial OpenAPI: POST /api/invitaciones/{token}/unirse
  const unirseMutation = useUnirse({
    mutation: {
      onSuccess: () => {
        setUnidoExitosamente(true);
        setErrorAccion(null);
      },
      onError: (err) => {
        setErrorAccion(getApiErrorMessage(err, 'No se pudo unir al partido con esta invitación'));
      },
    },
  });

  // Hook oficial OpenAPI: POST /api/invitaciones/{token}/reclamar
  const reclamarMutation = useReclamar({
    mutation: {
      onSuccess: () => {
        setReclamoExitoso(true);
        setErrorAccion(null);
      },
      onError: (err) => {
        setErrorAccion(getApiErrorMessage(err, 'No se pudo reclamar el perfil con este token'));
      },
    },
  });

  const handleUnirse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErrorAccion(null);

    unirseMutation.mutate({
      token,
      data: {
        equipo: equipoSeleccionado,
        nombre: estaAutenticado ? undefined : nombreInvitado.trim() || undefined,
        apellido: estaAutenticado ? undefined : apellidoInvitado.trim() || undefined,
      },
    });
  };

  const handleReclamarPerfil = () => {
    if (!token) return;
    if (!estaAutenticado) {
      // Redirigir a login preservando la ruta de reclamo
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setErrorAccion(null);
    reclamarMutation.mutate({ token });
  };

  if (isLoading) {
    return <LoadingSpinner mensaje="Verificando invitación..." className="py-20" />;
  }

  if (isError || !resumen) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-4">
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'El enlace de invitación no es válido o ha expirado')}
          onReintentar={() => refetch()}
        />
        <div className="text-center pt-2">
          <Link to="/">
            <Button variant="secondary" size="sm">Volver al Inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
      {/* Banner de Invitación CanchaYa */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-navy-800 text-center space-y-3 relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turf-500/20 text-turf-400 text-xs font-bold border border-turf-500/30">
          <Activity className="w-3.5 h-3.5" />
          Invitación Oficial CanchaYa
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          ¡Te han convocado a la cancha!
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Revisa los detalles del encuentro y confirma tu posición en el equipo.
        </p>
      </div>

      {/* Ficha Principal del Partido */}
      <Card className="p-6 space-y-4">
        {/* Enfrentamiento de Equipos */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Encuentro Deportivo
            </span>
            <StatusBadge status={resumen.estado || 'PROGRAMADO'} />
          </div>

          <div className="flex items-center justify-center gap-4 py-2">
            <div className="text-right flex-1">
              <span className="text-lg sm:text-xl font-black text-navy-900 block truncate">
                {resumen.nombreEquipoA || 'Equipo A'}
              </span>
              <span className="text-xs font-semibold text-turf-700">Lado A</span>
            </div>
            <span className="px-2.5 py-1 bg-navy-100 text-navy-800 rounded-md text-xs font-black tracking-widest">
              VS
            </span>
            <div className="text-left flex-1">
              <span className="text-lg sm:text-xl font-black text-navy-900 block truncate">
                {resumen.nombreEquipoB || 'Equipo B'}
              </span>
              <span className="text-xs font-semibold text-turf-700">Lado B</span>
            </div>
          </div>
        </div>

        {/* Datos de Cancha, Sede y Horario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 mt-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
            <MapPin className="w-5 h-5 text-turf-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block text-sm">
                {resumen.canchaNombre || 'Cancha Deportiva'}
              </span>
              <span className="text-slate-500">{resumen.sedeNombre || 'Sede Deportiva'}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
            <Calendar className="w-5 h-5 text-turf-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block text-sm">
                {resumen.fecha}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {resumen.horaInicio} a {resumen.horaFin}
              </span>
            </div>
          </div>
        </div>

        {/* Sensores y Grabación */}
        <div className="bg-turf-50/60 border border-turf-200/80 rounded-xl p-4 text-xs text-turf-950 flex items-start gap-3 mt-4">
          <ShieldCheck className="w-5 h-5 text-turf-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-turf-900">Partido con Seguimiento IoT & Cámaras:</span>
            <p className="text-turf-800 leading-relaxed">
              Los goles y jugadas del partido se detectan automáticamente por sensores y quedan registrados en tu historial.
            </p>
          </div>
        </div>

        {/* Sección de Unión o Reclamo */}
        <div className="pt-5 border-t border-slate-200 mt-6">
          {unidoExitosamente ? (
            <div className="p-5 rounded-xl bg-turf-50 border border-turf-300 text-turf-950 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 font-bold text-base text-turf-800">
                <CheckCircle2 className="w-5 h-5 text-turf-600" />
                <span>¡Te has unido exitosamente al partido!</span>
              </div>
              <p className="text-xs text-turf-700">
                Tu participación ha sido confirmada en la alineación del{' '}
                <strong>{equipoSeleccionado === 'A' ? (resumen.nombreEquipoA || 'Equipo A') : (resumen.nombreEquipoB || 'Equipo B')}</strong>.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                {resumen.partidoId && (
                  <Link to={`/partidos/${resumen.partidoId}`}>
                    <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                      Ver Partido en Vivo
                    </Button>
                  </Link>
                )}
                <Link to="/canchas">
                  <Button variant="secondary" size="sm">Explorar Canchas</Button>
                </Link>
              </div>
            </div>
          ) : reclamoExitoso ? (
            <div className="p-5 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 font-bold text-base text-blue-800">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>¡Perfil vinculado exitosamente!</span>
              </div>
              <p className="text-xs text-blue-700">
                Las estadísticas, goles y participaciones previas de este partido han quedado asociadas a tu cuenta.
              </p>
              <div className="pt-2 flex justify-center">
                <Link to="/perfil">
                  <Button variant="primary" size="sm">Ir a Mi Perfil</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Selector de Acción: Unirse o Reclamar Perfil */}
              <div className="flex border-b border-slate-200 mb-5">
                <button
                  type="button"
                  onClick={() => setModoReclamo(false)}
                  className={`pb-2.5 px-4 text-xs font-bold transition-colors border-b-2 ${
                    !modoReclamo
                      ? 'border-turf-600 text-turf-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Unirse al Partido
                </button>
                <button
                  type="button"
                  onClick={() => setModoReclamo(true)}
                  className={`pb-2.5 px-4 text-xs font-bold transition-colors border-b-2 ${
                    modoReclamo
                      ? 'border-turf-600 text-turf-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Reclamar Perfil de Invitado
                </button>
              </div>

              {errorAccion && (
                <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorAccion}</span>
                </div>
              )}

              {!modoReclamo ? (
                <form onSubmit={handleUnirse} className="space-y-4">
                  {/* Selección de Equipo */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Selecciona tu equipo:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEquipoSeleccionado('A')}
                        className={`p-3.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                          equipoSeleccionado === 'A'
                            ? 'border-turf-600 bg-turf-50/70 text-turf-900 ring-2 ring-turf-500/50'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Users className="w-4 h-4 text-turf-600" />
                        <span className="truncate w-full text-center">
                          {resumen.nombreEquipoA || 'Equipo A'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEquipoSeleccionado('B')}
                        className={`p-3.5 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                          equipoSeleccionado === 'B'
                            ? 'border-turf-600 bg-turf-50/70 text-turf-900 ring-2 ring-turf-500/50'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Users className="w-4 h-4 text-navy-600" />
                        <span className="truncate w-full text-center">
                          {resumen.nombreEquipoB || 'Equipo B'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Si no está autenticado, solicita Nombre y Apellido de invitado */}
                  {!estaAutenticado && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <p className="text-xs text-slate-600 font-medium">
                        Puedes unirte como invitado o iniciar sesión para acumular goles y estadísticas.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="Nombre"
                          placeholder="Tu nombre"
                          value={nombreInvitado}
                          onChange={(e) => setNombreInvitado(e.target.value)}
                          required
                        />
                        <Input
                          label="Apellido"
                          placeholder="Tu apellido"
                          value={apellidoInvitado}
                          onChange={(e) => setApellidoInvitado(e.target.value)}
                          required
                        />
                      </div>
                      <div className="text-center pt-1">
                        <Link
                          to="/login"
                          state={{ from: location.pathname }}
                          className="text-xs font-bold text-turf-700 hover:underline"
                        >
                          ¿Tienes cuenta? Inicia sesión aquí
                        </Link>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={unirseMutation.isPending}
                    className="w-full"
                    icon={<Trophy className="w-4 h-4" />}
                  >
                    {unirseMutation.isPending
                      ? 'Confirmando participación...'
                      : `Confirmar y Unirme al ${equipoSeleccionado === 'A' ? (resumen.nombreEquipoA || 'Equipo A') : (resumen.nombreEquipoB || 'Equipo B')}`}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <UserCheck className="w-4 h-4 text-turf-600" />
                      <span>Reclamo de Perfil de Jugador</span>
                    </div>
                    <p>
                      Si participaste previamente en este partido como jugador invitado, este enlace te permite vincular todas tus estadísticas, goles y asistencias a tu cuenta registrada.
                    </p>
                  </div>

                  {estaAutenticado ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={handleReclamarPerfil}
                      disabled={reclamarMutation.isPending}
                      icon={<UserCheck className="w-4 h-4" />}
                    >
                      {reclamarMutation.isPending
                        ? 'Vinculando historial...'
                        : `Vincular a mi cuenta (${usuario?.nombre || usuario?.correo})`}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        Debes iniciar sesión con tu cuenta registrada para reclamar y vincular este perfil de invitado.
                      </p>
                      <Link to="/login" state={{ from: location.pathname }}>
                        <Button variant="primary" size="md" className="w-full" icon={<LogIn className="w-4 h-4" />}>
                          Iniciar Sesión para Reclamar
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
