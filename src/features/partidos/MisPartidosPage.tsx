import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useListarMisPartidos,
  useIniciar,
  useFinalizar,
  useListarPorPartido1,
} from '@/api/endpoints';
import type { PartidoResponse } from '@/api/model/partidoResponse';
import type { ClipResponse } from '@/api/model/clipResponse';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Activity,
  Play,
  Square,
  Video,
  Film,
  Calendar,
  Users,
  Trophy,
  AlertCircle,
  ExternalLink,
  Share2,
} from 'lucide-react';

interface ClipsViewerModalProps {
  partido: PartidoResponse;
  onClose: () => void;
}

const ClipsViewerModal: React.FC<ClipsViewerModalProps> = ({ partido, onClose }) => {
  const {
    data: clips = [],
    isLoading,
    isError,
    error,
  } = useListarPorPartido1(partido.id || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">
              Clips y Repeticiones del Partido #{partido.id}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {isLoading && <LoadingSpinner mensaje="Cargando repeticiones del partido..." />}

        {isError && (
          <ErrorMessage
            mensaje={getApiErrorMessage(error, 'No se pudieron cargar los clips del partido')}
          />
        )}

        {!isLoading && !isError && clips.length === 0 && (
          <EmptyState
            titulo="No hay clips generados aún"
            descripcion="Los clips de video se generan automáticamente cuando los sensores de arco detectan goles durante el tiempo en juego."
            icono={<Video className="w-8 h-8 text-slate-400" />}
          />
        )}

        {!isLoading && !isError && clips.length > 0 && (
          <div className="space-y-3">
            {clips.map((clip: ClipResponse) => (
              <div
                key={clip.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Clip #{clip.id}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {clip.estado}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Duración: {clip.duracionSegundos || 23}s · Rango: -{clip.segundosAntes || 15}s / +{clip.segundosDespues || 8}s
                  </p>
                </div>

                {clip.urlVideo ? (
                  <a
                    href={clip.urlVideo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Clip de Video</span>
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    Procesando con FFmpeg...
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export const MisPartidosPage: React.FC = () => {
  const [partidoParaClips, setPartidoParaClips] = useState<PartidoResponse | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [tokenCopiado, setTokenCopiado] = useState<string | null>(null);

  const {
    data: partidos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListarMisPartidos();

  const iniciarMutation = useIniciar({
    mutation: {
      onSuccess: () => {
        setErrorAccion(null);
        refetch();
      },
      onError: (err) => {
        setErrorAccion(getApiErrorMessage(err, 'No se pudo iniciar el partido'));
      },
    },
  });

  const finalizarMutation = useFinalizar({
    mutation: {
      onSuccess: () => {
        setErrorAccion(null);
        refetch();
      },
      onError: (err) => {
        setErrorAccion(getApiErrorMessage(err, 'No se pudo finalizar el partido'));
      },
    },
  });

  const handleIniciar = (partidoId?: number) => {
    if (!partidoId) return;
    setErrorAccion(null);
    iniciarMutation.mutate({ id: partidoId });
  };

  const handleFinalizar = (partidoId?: number) => {
    if (!partidoId) return;
    setErrorAccion(null);
    finalizarMutation.mutate({ id: partidoId });
  };

  const getBadgeEstado = (estado?: string) => {
    switch (estado) {
      case 'PROGRAMADO':
        return {
          label: 'Programado',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'EN_JUEGO':
        return {
          label: '🔴 En Juego (Grabando)',
          color: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
        };
      case 'FINALIZADO':
        return {
          label: 'Finalizado',
          color: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      case 'CANCELADO':
        return {
          label: 'Cancelado',
          color: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      default:
        return {
          label: estado || 'Desconocido',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/60 text-emerald-100 text-xs font-semibold mb-3">
            <Activity className="w-3.5 h-3.5" />
            Control de Partidos & Grabación en Vivo
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mis Partidos
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100 leading-relaxed">
            Inicia tus partidos cuando ingreses a la cancha para activar la cámara y la detección inteligente de goles por sensores IoT, y revive los mejores clips de video.
          </p>
        </div>
      </div>

      {errorAccion && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorAccion}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorAccion(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Estados de Carga y Error */}
      {isLoading && <LoadingSpinner mensaje="Cargando tus partidos..." />}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al obtener tus partidos')}
          onReintentar={() => refetch()}
        />
      )}

      {!isLoading && !isError && partidos.length === 0 && (
        <EmptyState
          titulo="No tienes partidos activos"
          descripcion="Los partidos se generan a partir de tus reservas pagadas y confirmadas."
          icono={<Activity className="w-8 h-8 text-slate-400" />}
          accion={
            <Link
              to="/mis-reservas"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <span>Ir a Mis Reservas</span>
            </Link>
          }
        />
      )}

      {/* Lista de Partidos */}
      {!isLoading && !isError && partidos.length > 0 && (
        <div className="space-y-4">
          {partidos.map((partido) => {
            const badge = getBadgeEstado(partido.estado);
            const esProgramado = partido.estado === 'PROGRAMADO';
            const esEnJuego = partido.estado === 'EN_JUEGO';
            const esFinalizado = partido.estado === 'FINALIZADO';

            return (
              <div
                key={partido.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}
                    >
                      <span>{badge.label}</span>
                    </span>

                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Partido #{partido.id}
                    </span>

                    {partido.tokenInvitacion && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          Token: {partido.tokenInvitacion}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/invitaciones/${partido.tokenInvitacion}`;
                            navigator.clipboard.writeText(url);
                            setTokenCopiado(partido.tokenInvitacion || null);
                            setTimeout(() => setTokenCopiado(null), 3000);
                          }}
                          className="text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 inline-flex items-center gap-1 transition cursor-pointer"
                          title="Copiar enlace de invitación para compartir con amigos"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>{tokenCopiado === partido.tokenInvitacion ? '¡Copiado!' : 'Compartir enlace'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800">
                    {partido.nombreEquipoA || 'Equipo A'} vs {partido.nombreEquipoB || 'Equipo B'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    {partido.reservaId && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-medium text-slate-800">
                          Reserva #{partido.reservaId}
                        </span>
                      </div>
                    )}

                    {partido.inicioReal && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Inicio: {new Date(partido.inicioReal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        Marcador: <strong className="text-slate-800">{partido.golesEquipoA ?? 0} - {partido.golesEquipoB ?? 0}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{partido.participantes?.length || 0} jugadores inscritos</span>
                    </div>
                  </div>

                  {esEnJuego && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-2">
                      <Video className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>
                        <strong>Grabación y Sensores activos:</strong> Cada gol detectado por los sensores generará un clip de video automáticamente.
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones del Partido */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {esProgramado && (
                    <button
                      type="button"
                      disabled={iniciarMutation.isPending}
                      onClick={() => handleIniciar(partido.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{iniciarMutation.isPending ? 'Iniciando...' : 'Iniciar Partido & Grabación'}</span>
                    </button>
                  )}

                  {esEnJuego && (
                    <button
                      type="button"
                      disabled={finalizarMutation.isPending}
                      onClick={() => handleFinalizar(partido.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>{finalizarMutation.isPending ? 'Finalizando...' : 'Finalizar Partido'}</span>
                    </button>
                  )}

                  {(esEnJuego || esFinalizado) && (
                    <button
                      type="button"
                      onClick={() => setPartidoParaClips(partido)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition"
                    >
                      <Film className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ver Clips en Video</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Clips */}
      {partidoParaClips && (
        <ClipsViewerModal
          partido={partidoParaClips}
          onClose={() => setPartidoParaClips(null)}
        />
      )}
    </div>
  );
};
