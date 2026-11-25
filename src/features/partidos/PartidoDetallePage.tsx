import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useObtenerPorId1,
  useIniciar,
  useFinalizar,
  useListarPorPartido,
  useRegistrar,
  useAtribuir,
  useConfirmar,
  useDescartar,
  useListarPorPartido1,
  useObtenerPorId4,
  useDescartar1,
  useReintentar,
  useRevocarToken,
  useAgregarParticipante,
  useListarTodos,
} from '@/api/endpoints';
import type { PartidoResponse } from '@/api/model/partidoResponse';
import type { ParticipanteResponse } from '@/api/model/participanteResponse';
import type { EventoResponse } from '@/api/model/eventoResponse';
import type { ClipResponse } from '@/api/model/clipResponse';
import type { JugadorResponse } from '@/api/model/jugadorResponse';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { QrCodeSvg } from '@/components/ui/QrCodeSvg';
import { Notification } from '@/components/ui/Notification';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Play,
  Square,
  Share2,
  QrCode,
  Copy,
  Check,
  Users,
  UserPlus,
  Activity,
  Film,
  RotateCw,
  Trash2,
  Clock,
  Video,
  PlusCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export const PartidoDetallePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const partidoId = Number(id) || 0;
  const { rol } = useAuth();

  // Estados de modales
  const [modalIniciar, setModalIniciar] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [modalQr, setModalQr] = useState(false);
  const [modalAgregarParticipante, setModalAgregarParticipante] = useState(false);
  const [modalRegistrarEvento, setModalRegistrarEvento] = useState(false);
  const [eventoParaAtribuir, setEventoParaAtribuir] = useState<EventoResponse | null>(null);
  const [clipActivoId, setClipActivoId] = useState<number | null>(null);

  // Estados de formularios y notificaciones
  const [copiado, setCopiado] = useState(false);
  const [notificacion, setNotificacion] = useState<{ tipo: 'success' | 'danger' | 'warning'; mensaje: string } | null>(null);

  // Formulario agregar participante
  const [nuevoParticipanteEquipo, setNuevoParticipanteEquipo] = useState<'A' | 'B'>('A');
  const [nuevoParticipanteEsInvitado, setNuevoParticipanteEsInvitado] = useState(false);
  const [nuevoParticipanteJugadorId, setNuevoParticipanteJugadorId] = useState<string>('');
  const [nuevoParticipanteNombre, setNuevoParticipanteNombre] = useState('');
  const [nuevoParticipanteApellido, setNuevoParticipanteApellido] = useState('');

  // Formulario registrar evento
  const [eventoTipo, setEventoTipo] = useState<'GOL' | 'TARJETA_AMARILLA' | 'TARJETA_ROJA'>('GOL');
  const [eventoEquipo, setEventoEquipo] = useState<'A' | 'B'>('A');
  const [eventoMinuto, setEventoMinuto] = useState<number>(1);
  const [eventoAnotadorId, setEventoAnotadorId] = useState<string>('');
  const [eventoDescripcion, setEventoDescripcion] = useState('');

  // Formulario atribuir gol
  const [atribAnotadorId, setAtribAnotadorId] = useState<string>('');
  const [atribAsistenteId, setAtribAsistenteId] = useState<string>('');

  // Queries
  const {
    data: partido,
    isLoading: cargandoPartido,
    isError: errorPartido,
    refetch: refetchPartido,
  } = useObtenerPorId1(partidoId, {
    query: {
      enabled: partidoId > 0,
      refetchInterval: (query) => {
        const data = query.state.data as PartidoResponse | undefined;
        return data?.estado === 'EN_JUEGO' ? 5000 : false;
      },
    },
  });

  const { data: eventos = [], refetch: refetchEventos } = useListarPorPartido(partidoId, {
    query: {
      enabled: partidoId > 0,
      refetchInterval: () => (partido?.estado === 'EN_JUEGO' ? 5000 : false),
    },
  });

  const { data: clips = [], refetch: refetchClips } = useListarPorPartido1(partidoId, {
    query: {
      enabled: partidoId > 0,
      refetchInterval: () => (partido?.estado === 'EN_JUEGO' ? 8000 : false),
    },
  });

  const { data: clipDetalle } = useObtenerPorId4(clipActivoId || 0, {
    query: { enabled: !!clipActivoId },
  });

  const { data: jugadores = [] } = useListarTodos();

  const DEMO_PARTIDO: PartidoResponse = {
    id: partidoId || 1,
    estado: 'EN_JUEGO',
    nombreEquipoA: 'Galácticos FC',
    nombreEquipoB: 'Furia Roja',
    golesEquipoA: 3,
    golesEquipoB: 2,
    reservaId: 104,
    tokenInvitacion: 'INV-DEMO-2026',
    inicioReal: new Date().toISOString(),
    participantes: [
      { id: 101, equipo: 'A', nombreVisible: 'Carlos Gómez', invitado: false },
      { id: 102, equipo: 'A', nombreVisible: 'Mateo Fernández', invitado: false },
      { id: 103, equipo: 'A', nombreVisible: 'Diego Ramos (Invitado)', invitado: true },
      { id: 104, equipo: 'B', nombreVisible: 'Lucas Silva', invitado: false },
      { id: 105, equipo: 'B', nombreVisible: 'Andrés Torres', invitado: false },
      { id: 106, equipo: 'B', nombreVisible: 'Juan Morales (Invitado)', invitado: true },
    ],
  };

  const DEMO_EVENTOS: EventoResponse[] = [
    { id: 1, tipo: 'GOL', equipo: 'A', minuto: 12, anotadorNombre: 'Carlos Gómez', asistenteNombre: 'Mateo Fernández', estado: 'CONFIRMADO' },
    { id: 2, tipo: 'GOL', equipo: 'B', minuto: 24, anotadorNombre: 'Lucas Silva', estado: 'CONFIRMADO' },
    { id: 3, tipo: 'TARJETA_AMARILLA', equipo: 'A', minuto: 31, motivo: 'Falta táctica en medio campo', estado: 'CONFIRMADO' },
    { id: 4, tipo: 'GOL', equipo: 'A', minuto: 38, estado: 'PENDIENTE_ATRIBUCION', descripcion: 'Detección automática por Sensor de Arco Sur' },
  ];

  const DEMO_CLIPS: ClipResponse[] = [
    { id: 1, estado: 'LISTO', duracionSegundos: 23, segundosAntes: 15, segundosDespues: 8, urlVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
    { id: 2, estado: 'PROCESANDO', duracionSegundos: 23, segundosAntes: 15, segundosDespues: 8 },
    { id: 3, estado: 'ERROR', duracionSegundos: 23, segundosAntes: 15, segundosDespues: 8 },
  ];

  const partidoData = partido || DEMO_PARTIDO;
  const eventosData = eventos.length > 0 ? eventos : DEMO_EVENTOS;
  const clipsData = clips.length > 0 ? clips : DEMO_CLIPS;

  // Mutations
  const iniciarMutation = useIniciar({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'success', mensaje: 'Partido iniciado exitosamente. Grabación de cámaras activada.' });
        setModalIniciar(false);
        refetchPartido();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo iniciar el partido') }),
    },
  });

  const finalizarMutation = useFinalizar({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'success', mensaje: 'Partido finalizado. El marcador y las estadísticas oficiales han sido consolidados.' });
        setModalFinalizar(false);
        refetchPartido();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo finalizar el partido') }),
    },
  });

  const revocarTokenMutation = useRevocarToken({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'success', mensaje: 'Enlace de invitación revocado y generado uno nuevo.' });
        refetchPartido();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo revocar el token') }),
    },
  });

  const agregarParticipanteMutation = useAgregarParticipante({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'success', mensaje: 'Participante añadido a la alineación.' });
        setModalAgregarParticipante(false);
        setNuevoParticipanteNombre('');
        setNuevoParticipanteApellido('');
        setNuevoParticipanteJugadorId('');
        refetchPartido();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo agregar al participante') }),
    },
  });

  const registrarEventoMutation = useRegistrar({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'success', mensaje: 'Evento registrado en el acta del partido.' });
        setModalRegistrarEvento(false);
        refetchPartido();
        refetchEventos();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo registrar el evento') }),
    },
  });

  const atribuirMutation = useAtribuir({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'success', mensaje: 'Atribución de gol y asistencia guardada.' });
        setEventoParaAtribuir(null);
        refetchEventos();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo atribuir el gol') }),
    },
  });

  const confirmarEventoMutation = useConfirmar({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'success', mensaje: 'Evento de gol confirmado oficialmente.' });
        refetchPartido();
        refetchEventos();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo confirmar el evento') }),
    },
  });

  const descartarEventoMutation = useDescartar({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'warning', mensaje: 'Detección descartada como jugada inválida.' });
        refetchPartido();
        refetchEventos();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo descartar el evento') }),
    },
  });

  const descartarClipMutation = useDescartar1({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'warning', mensaje: 'Clip descartado de la galería.' });
        refetchClips();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo descartar el clip') }),
    },
  });

  const reintentarClipMutation = useReintentar({
    mutation: {
      onSuccess: () => {
        setNotificacion({ tipo: 'success', mensaje: 'Reintento de procesamiento de video encolado.' });
        refetchClips();
      },
      onError: (err) => setNotificacion({ tipo: 'danger', mensaje: getApiErrorMessage(err, 'No se pudo reintentar el procesamiento') }),
    },
  });

  const esModoDemo = !partido && (errorPartido || !cargandoPartido);

  const urlInvitacion = `${window.location.origin}/invitaciones/${partidoData.tokenInvitacion || 'INV-DEMO-2026'}`;

  const copiarEnlace = () => {
    navigator.clipboard.writeText(urlInvitacion);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleAgregarParticipante = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoParticipanteEsInvitado) {
      if (!nuevoParticipanteNombre.trim()) return;
      agregarParticipanteMutation.mutate({
        id: partidoId,
        data: {
          equipo: nuevoParticipanteEquipo,
          nombreInvitado: nuevoParticipanteNombre.trim(),
          apellidoInvitado: nuevoParticipanteApellido.trim() || undefined,
        },
      });
    } else {
      const jId = Number(nuevoParticipanteJugadorId);
      if (!jId) return;
      agregarParticipanteMutation.mutate({
        id: partidoId,
        data: {
          equipo: nuevoParticipanteEquipo,
          jugadorId: jId,
        },
      });
    }
  };

  const handleRegistrarEvento = (e: React.FormEvent) => {
    e.preventDefault();
    registrarEventoMutation.mutate({
      partidoId,
      data: {
        tipo: eventoTipo,
        equipo: eventoEquipo,
        minuto: eventoMinuto,
        jugadorParticipanteId: eventoAnotadorId ? Number(eventoAnotadorId) : undefined,
        motivo: eventoDescripcion.trim() || undefined,
      },
    });
  };

  const handleAtribuir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoParaAtribuir?.id) return;
    atribuirMutation.mutate({
      id: eventoParaAtribuir.id,
      data: {
        anotadorId: atribAnotadorId ? Number(atribAnotadorId) : undefined,
        asistenteId: atribAsistenteId ? Number(atribAsistenteId) : undefined,
      },
    });
  };

  const participantesA = partidoData.participantes?.filter((p) => p.equipo === 'A') || [];
  const participantesB = partidoData.participantes?.filter((p) => p.equipo === 'B') || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Notificación flotante de feedback */}
      {esModoDemo && (
        <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800 text-white text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <StatusBadge status="SIMULADO" size="sm" />
            <span className="text-navy-300">
              Visualizando encuentro en <strong>Modo Demostración</strong> para revisión de interfaz y diseño.
            </span>
          </div>
          <span className="text-[11px] font-mono text-limeAccent-400">Entrega Académica</span>
        </div>
      )}
      {notificacion && (
        <Notification
          type={notificacion.tipo}
          message={notificacion.mensaje}
          onClose={() => setNotificacion(null)}
        />
      )}

      {/* Navegación superior */}
      <div className="flex items-center justify-between">
        <Link
          to="/mis-partidos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-navy-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Mis Partidos</span>
        </Link>
        <span className="text-xs text-navy-500 font-mono">
          Partido #{partidoData.id} · Reserva #{partidoData.reservaId}
        </span>
      </div>

      {/* 1. MARCADOR DIGITAL DEPORTIVO EN VIVO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-turf-950 text-white p-6 sm:p-10 border border-navy-800 shadow-2xl">
        {/* Cabecera del Marcador */}
        <div className="flex items-center justify-between border-b border-navy-800/80 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <StatusBadge status={partidoData.estado || 'PROGRAMADO'} />
            {partidoData.estado === 'EN_JUEGO' && (
              <span className="text-xs font-mono text-limeAccent-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-limeAccent-400 animate-ping" />
                Detección IoT Activa
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copiarEnlace}
              className="bg-navy-900 border-navy-700 text-navy-200 hover:text-white"
              icon={copiado ? <Check className="w-3.5 h-3.5 text-limeAccent-400" /> : <Share2 className="w-3.5 h-3.5" />}
            >
              {copiado ? 'Enlace Copiado' : 'Invitar Jugadores'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalQr(true)}
              className="bg-navy-900 border-navy-700 text-navy-200 hover:text-white"
              icon={<QrCode className="w-3.5 h-3.5" />}
              aria-label="Ver Código QR"
            >
              QR
            </Button>
          </div>
        </div>

        {/* Tanteador Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 text-center my-4">
          {/* Equipo A */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-turf-400">
              Equipo Local (A)
            </span>
            <h2 className="font-display font-extrabold text-xl sm:text-3xl text-white">
              {partidoData.nombreEquipoA || 'Equipo A'}
            </h2>
            <p className="text-xs text-navy-400">{participantesA.length} jugadores inscritos</p>
          </div>

          {/* Marcador Numérico */}
          <div className="flex flex-col items-center justify-center p-4 bg-navy-950/80 rounded-2xl border border-navy-800/90 shadow-inner">
            <div className="font-display font-extrabold text-5xl sm:text-6xl tracking-tight text-white flex items-center gap-4">
              <span className="text-limeAccent-400">{partidoData.golesEquipoA ?? 0}</span>
              <span className="text-navy-600 text-3xl">-</span>
              <span className="text-limeAccent-400">{partidoData.golesEquipoB ?? 0}</span>
            </div>
            <span className="text-[11px] font-semibold text-navy-400 uppercase tracking-widest mt-1">
              {partidoData.estado === 'FINALIZADO' ? 'Resultado Final' : 'Marcador Oficial'}
            </span>
          </div>

          {/* Equipo B */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              Equipo Visitante (B)
            </span>
            <h2 className="font-display font-extrabold text-xl sm:text-3xl text-white">
              {partidoData.nombreEquipoB || 'Equipo B'}
            </h2>
            <p className="text-xs text-navy-400">{participantesB.length} jugadores inscritos</p>
          </div>
        </div>

        {/* Barra de Acciones del Partido */}
        <div className="pt-6 border-t border-navy-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-navy-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {partidoData.inicioReal ? `Iniciado: ${new Date(partidoData.inicioReal).toLocaleTimeString('es-PE')}` : 'A la espera del pitazo inicial'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {partidoData.estado === 'PROGRAMADO' && (
              <Button
                variant="lime"
                size="sm"
                onClick={() => setModalIniciar(true)}
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Iniciar Partido (Grabar)
              </Button>
            )}

            {partidoData.estado === 'EN_JUEGO' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalRegistrarEvento(true)}
                  className="bg-navy-900 border-navy-700 text-white"
                  icon={<PlusCircle className="w-3.5 h-3.5 text-turf-400" />}
                >
                  Registrar Evento
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setModalFinalizar(true)}
                  icon={<Square className="w-4 h-4 fill-current" />}
                >
                  Finalizar Partido
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. ALINEACIONES Y PARTICIPANTES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-navy-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-turf-600" />
            <span>Alineación de Equipos</span>
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalAgregarParticipante(true)}
            icon={<UserPlus className="w-3.5 h-3.5" />}
          >
            Agregar Participante
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Equipo A */}
          <Card variant="default">
            <CardHeader className="bg-turf-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-turf-900">
                  {partidoData.nombreEquipoA || 'Equipo A'}
                </CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-turf-100 text-turf-800">
                  {participantesA.length} inscritos
                </span>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-navy-100 p-0">
              {participantesA.length === 0 ? (
                <p className="p-4 text-xs text-navy-500 italic text-center">No hay jugadores asignados al Equipo A</p>
              ) : (
                participantesA.map((p: ParticipanteResponse) => (
                  <div key={p.id} className="p-3.5 px-5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy-900">{p.nombreVisible}</span>
                      {p.invitado ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Invitado
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-turf-50 text-turf-700 border border-turf-200 font-medium">
                          Registrado
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Columna Equipo B */}
          <Card variant="default">
            <CardHeader className="bg-sky-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-sky-900">
                  {partidoData.nombreEquipoB || 'Equipo B'}
                </CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  {participantesB.length} inscritos
                </span>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-navy-100 p-0">
              {participantesB.length === 0 ? (
                <p className="p-4 text-xs text-navy-500 italic text-center">No hay jugadores asignados al Equipo B</p>
              ) : (
                participantesB.map((p: ParticipanteResponse) => (
                  <div key={p.id} className="p-3.5 px-5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy-900">{p.nombreVisible}</span>
                      {p.invitado ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Invitado
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-turf-50 text-turf-700 border border-turf-200 font-medium">
                          Registrado
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. CRONOLOGÍA DE EVENTOS (GOLES Y TARJETAS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-navy-950 flex items-center gap-2">
            <Activity className="w-5 h-5 text-turf-600" />
            <span>Acta y Cronología del Encuentro</span>
          </h3>
        </div>

        <Card variant="default">
          <CardContent className="p-0">
            {eventosData.length === 0 ? (
              <div className="p-8 text-center text-xs text-navy-500">
                Aún no se registran eventos oficiales (goles o tarjetas) en este encuentro.
              </div>
            ) : (
              <div className="divide-y divide-navy-100">
                {eventosData.map((ev: EventoResponse) => (
                  <div key={ev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy-100 text-navy-900 flex items-center justify-center font-display font-bold text-sm shrink-0">
                        {ev.minuto}&apos;
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-900 text-sm">
                            {ev.tipo === 'GOL' ? 'Gol' : ev.tipo === 'TARJETA_AMARILLA' ? 'Tarjeta Amarilla' : 'Tarjeta Roja'}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-navy-100 text-navy-700">
                            Equipo {ev.equipo}
                          </span>
                          <StatusBadge status={ev.estado || 'CONFIRMADO'} size="sm" />
                        </div>
                        <p className="text-xs text-navy-600">
                          {ev.anotadorNombre ? `Anotador: ${ev.anotadorNombre}` : ev.descripcion || 'Detección por sensor de arco'}
                          {ev.asistenteNombre && ` · Asistencia: ${ev.asistenteNombre}`}
                        </p>
                      </div>
                    </div>

                    {/* Acciones de Atribución y Confirmación */}
                    <div className="flex items-center gap-2">
                      {ev.tipo === 'GOL' && (!ev.anotadorId || ev.estado === 'PENDIENTE_ATRIBUCION') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEventoParaAtribuir(ev);
                            setAtribAnotadorId(ev.anotadorId ? String(ev.anotadorId) : '');
                            setAtribAsistenteId(ev.asistenteId ? String(ev.asistenteId) : '');
                          }}
                        >
                          Atribuir Autor
                        </Button>
                      )}

                      {ev.estado === 'PENDIENTE_ATRIBUCION' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => confirmarEventoMutation.mutate({ id: ev.id! })}
                          >
                            Confirmar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => descartarEventoMutation.mutate({ id: ev.id! })}
                          >
                            Descartar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. CLIPS Y REPETICIONES DE VIDEO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-navy-950 flex items-center gap-2">
            <Film className="w-5 h-5 text-turf-600" />
            <span>Repeticiones & Highlights Generados</span>
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchClips()}
            icon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Actualizar Clips
          </Button>
        </div>

        {clipsData.length === 0 ? (
          <Card variant="default" className="p-8 text-center text-xs text-navy-500">
            Los clips de video se generan automáticamente a partir de los goles detectados durante el partido.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clipsData.map((clip: ClipResponse) => (
              <Card key={clip.id} variant="elevated" className="overflow-hidden flex flex-col justify-between">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-navy-900">Clip #{clip.id}</span>
                    <StatusBadge status={clip.estado || 'LISTO'} size="sm" />
                  </div>
                  <p className="text-xs text-navy-600">
                    Duración: {clip.duracionSegundos || 23}s (-{clip.segundosAntes || 15}s / +{clip.segundosDespues || 8}s)
                  </p>
                </div>

                <div className="p-3 bg-navy-50/80 border-t border-navy-100 flex items-center justify-between gap-2">
                  {clip.urlVideo ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setClipActivoId(clip.id || null)}
                      icon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      Reproducir
                    </Button>
                  ) : clip.estado === 'ERROR' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => reintentarClipMutation.mutate({ id: clip.id! })}
                      icon={<RotateCw className="w-3.5 h-3.5" />}
                    >
                      Reintentar
                    </Button>
                  ) : (
                    <span className="text-[11px] text-navy-500 font-medium">Procesando FFmpeg...</span>
                  )}

                  <button
                    type="button"
                    onClick={() => descartarClipMutation.mutate({ id: clip.id! })}
                    className="p-1.5 text-navy-400 hover:text-rose-600 rounded-lg transition"
                    title="Descartar clip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Código QR de Invitación */}
      <Modal
        isOpen={modalQr}
        onClose={() => setModalQr(false)}
        title="Código QR del Encuentro"
        description="Escanea este código desde la cámara de tu smartphone para acceder directamente a la invitación y unirte a un equipo."
        size="sm"
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-2">
          <QrCodeSvg value={urlInvitacion} size={200} />
          <div className="w-full text-center space-y-2">
            <p className="text-xs text-navy-500 truncate max-w-xs mx-auto font-mono bg-navy-50 p-2 rounded-xl border border-navy-200">
              {urlInvitacion}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={copiarEnlace} icon={<Copy className="w-3.5 h-3.5" />}>
                Copiar Enlace
              </Button>
              {(rol === 'ADMIN' || rol === 'ADMIN_SEDE') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revocarTokenMutation.mutate({ id: partidoId })}
                  isLoading={revocarTokenMutation.isPending}
                  className="text-rose-600 hover:bg-rose-50"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Revocar Token
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: Iniciar Partido */}
      <Modal
        isOpen={modalIniciar}
        onClose={() => setModalIniciar(false)}
        title="¿Iniciar Partido?"
        description="Al iniciar el encuentro, se activará la sincronización en vivo con sensores de arco IoT, el cronómetro digital y la captura de repeticiones en video."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalIniciar(false)}>
              Cancelar
            </Button>
            <Button
              variant="lime"
              size="sm"
              onClick={() => iniciarMutation.mutate({ id: partidoId })}
              isLoading={iniciarMutation.isPending}
            >
              Confirmar e Iniciar
            </Button>
          </>
        }
      >
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
          Asegúrate de que los participantes de ambos equipos se encuentren listos sobre el terreno de juego.
        </div>
      </Modal>

      {/* MODAL: Finalizar Partido */}
      <Modal
        isOpen={modalFinalizar}
        onClose={() => setModalFinalizar(false)}
        title="¿Finalizar Encuentro?"
        description="Esta acción dará por concluido el tiempo de juego, consolidará el marcador final en la base de datos y sumará los puntos y goles a la tabla de rankings oficiales."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalFinalizar(false)}>
              Volver al Juego
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => finalizarMutation.mutate({ id: partidoId })}
              isLoading={finalizarMutation.isPending}
            >
              Finalizar Oficialmente
            </Button>
          </>
        }
      >
        <div className="p-3 bg-navy-50 rounded-xl border border-navy-200 text-xs text-navy-700">
          Marcador actual: <strong>{partidoData.golesEquipoA ?? 0}</strong> a <strong>{partidoData.golesEquipoB ?? 0}</strong>.
        </div>
      </Modal>

      {/* MODAL: Agregar Participante */}
      <Modal
        isOpen={modalAgregarParticipante}
        onClose={() => setModalAgregarParticipante(false)}
        title="Agregar Participante al Partido"
        description="Registra un jugador con cuenta oficial o anota a un invitado por nombre."
        size="md"
      >
        <form onSubmit={handleAgregarParticipante} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNuevoParticipanteEquipo('A')}
              className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                nuevoParticipanteEquipo === 'A'
                  ? 'bg-turf-600 text-white border-turf-700'
                  : 'bg-white text-navy-700 border-navy-200'
              }`}
            >
              {partidoData.nombreEquipoA || 'Equipo A'}
            </button>
            <button
              type="button"
              onClick={() => setNuevoParticipanteEquipo('B')}
              className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                nuevoParticipanteEquipo === 'B'
                  ? 'bg-sky-600 text-white border-sky-700'
                  : 'bg-white text-navy-700 border-navy-200'
              }`}
            >
              {partidoData.nombreEquipoB || 'Equipo B'}
            </button>
          </div>

          <div className="flex items-center gap-3 py-1">
            <label className="text-xs font-semibold text-navy-700 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoParticipanteEsInvitado}
                onChange={(e) => setNuevoParticipanteEsInvitado(e.target.checked)}
                className="rounded border-navy-300 text-turf-600 focus:ring-turf-500"
              />
              <span>Es un invitado sin cuenta de usuario</span>
            </label>
          </div>

          {nuevoParticipanteEsInvitado ? (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre del invitado"
                required
                value={nuevoParticipanteNombre}
                onChange={(e) => setNuevoParticipanteNombre(e.target.value)}
                placeholder="Ej. Martín"
              />
              <Input
                label="Apellido (opcional)"
                value={nuevoParticipanteApellido}
                onChange={(e) => setNuevoParticipanteApellido(e.target.value)}
                placeholder="Ej. López"
              />
            </div>
          ) : (
            <Select
              label="Seleccionar Jugador Registrado"
              value={nuevoParticipanteJugadorId}
              onChange={(e) => setNuevoParticipanteJugadorId(e.target.value)}
              placeholder="Elige un usuario..."
              options={jugadores.map((j: JugadorResponse) => ({
                value: j.id || 0,
                label: `${j.nombre} ${j.apellido} (${j.correo})`,
              }))}
            />
          )}

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setModalAgregarParticipante(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={agregarParticipanteMutation.isPending}
            >
              Guardar Participante
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Registrar Evento Manual */}
      <Modal
        isOpen={modalRegistrarEvento}
        onClose={() => setModalRegistrarEvento(false)}
        title="Registrar Evento en el Partido"
        description="Ingresa manualmente una jugada destacada (gol o sanción disciplinaria)."
        size="md"
      >
        <form onSubmit={handleRegistrarEvento} className="space-y-4">
          <Select
            label="Tipo de Evento"
            value={eventoTipo}
            onChange={(e) => setEventoTipo(e.target.value as any)}
            options={[
              { value: 'GOL', label: 'Gol anotado' },
              { value: 'TARJETA_AMARILLA', label: 'Tarjeta Amarilla' },
              { value: 'TARJETA_ROJA', label: 'Tarjeta Roja' },
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Equipo"
              value={eventoEquipo}
              onChange={(e) => setEventoEquipo(e.target.value as any)}
              options={[
                { value: 'A', label: `Equipo A (${partidoData.nombreEquipoA || 'Local'})` },
                { value: 'B', label: `Equipo B (${partidoData.nombreEquipoB || 'Visitante'})` },
              ]}
            />
            <Input
              label="Minuto de juego"
              type="number"
              min={1}
              max={150}
              required
              value={eventoMinuto}
              onChange={(e) => setEventoMinuto(Number(e.target.value))}
            />
          </div>

          <Select
            label="Anotador / Jugador Involucrado"
            value={eventoAnotadorId}
            onChange={(e) => setEventoAnotadorId(e.target.value)}
            placeholder="Selecciona participante..."
            options={(eventoEquipo === 'A' ? participantesA : participantesB).map((p) => ({
              value: p.id || 0,
              label: p.nombreVisible || 'Jugador',
            }))}
          />

          <Input
            label="Detalle / Descripción (opcional)"
            value={eventoDescripcion}
            onChange={(e) => setEventoDescripcion(e.target.value)}
            placeholder="Ej. Gol de tiro libre al ángulo"
          />

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setModalRegistrarEvento(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={registrarEventoMutation.isPending}>
              Registrar Evento
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Atribuir Gol y Asistencia */}
      <Modal
        isOpen={!!eventoParaAtribuir}
        onClose={() => setEventoParaAtribuir(null)}
        title="Atribuir Gol y Asistencia"
        description="Asigna la autoría oficial de este gol a los jugadores del equipo para las tablas de clasificación."
        size="md"
      >
        <form onSubmit={handleAtribuir} className="space-y-4">
          <Select
            label="Autor del Gol (Anotador)"
            value={atribAnotadorId}
            onChange={(e) => setAtribAnotadorId(e.target.value)}
            placeholder="Elige al anotador..."
            options={(eventoParaAtribuir?.equipo === 'B' ? participantesB : participantesA).map((p) => ({
              value: p.id || 0,
              label: p.nombreVisible || 'Jugador',
            }))}
          />

          <Select
            label="Asistencia / Pase Gol (opcional)"
            value={atribAsistenteId}
            onChange={(e) => setAtribAsistenteId(e.target.value)}
            placeholder="Ninguna o no aplica..."
            options={(eventoParaAtribuir?.equipo === 'B' ? participantesB : participantesA)
              .filter((p) => String(p.id) !== atribAnotadorId)
              .map((p) => ({
                value: p.id || 0,
                label: p.nombreVisible || 'Jugador',
              }))}
          />

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEventoParaAtribuir(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={atribuirMutation.isPending}>
              Guardar Atribución
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Reproductor de Clip de Video */}
      <Modal
        isOpen={!!clipActivoId}
        onClose={() => setClipActivoId(null)}
        title={`Reproducción Oficial · Clip #${clipActivoId}`}
        description="Repetición capturada automáticamente por las cámaras perimetrales de la cancha."
        size="lg"
      >
        <div className="space-y-4">
          <div className="aspect-video bg-navy-950 rounded-2xl overflow-hidden flex items-center justify-center border border-navy-800">
            {clipDetalle?.urlVideoFirmada || clipDetalle?.urlVideo ? (
              <video
                src={clipDetalle.urlVideoFirmada || clipDetalle.urlVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Tu navegador no soporta reproducción de video HTML5.
              </video>
            ) : (
              <div className="text-center p-6 space-y-2">
                <Video className="w-10 h-10 text-turf-400 mx-auto animate-pulse" />
                <p className="text-xs text-navy-300">Cargando streaming seguro del clip...</p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setClipActivoId(null)}>
              Cerrar Reproductor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
