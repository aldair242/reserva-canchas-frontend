import React, { useState, useEffect } from 'react';
import {
  useProcesarDeteccionPartido,
  useProcesarDeteccionCamara,
  useListarMisPartidos,
  useObtenerPorId1,
  useListarPorCancha,
  useListarTodas1,
  useListarPorPartido,
  useListarPorPartido1,
} from '@/api/endpoints';
import type { DeteccionYoloRequestEquipo } from '@/api/model/deteccionYoloRequestEquipo';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Radio,
  Cpu,
  Video,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Clock,
  Film,
} from 'lucide-react';

export const DemoYoloPage: React.FC = () => {
  // Partidos disponibles para simular (o listar mis partidos como admin)
  const { data: partidos = [] } = useListarMisPartidos();
  const [partidoIdSeleccionado, setPartidoIdSeleccionado] = useState<number | undefined>(undefined);

  // Canchas y cámaras
  const { data: canchas = [] } = useListarTodas1();
  const [canchaIdSeleccionada, setCanchaIdSeleccionada] = useState<number | undefined>(undefined);

  const { data: dispositivosCancha = [] } = useListarPorCancha(
    canchaIdSeleccionada ?? 0
  );

  const camaras = dispositivosCancha.filter((d) => d.tipo === 'CAMARA' || !d.ubicacion);
  const [camaraIdSeleccionada, setCamaraIdSeleccionada] = useState<number | undefined>(undefined);

  // Parámetros de simulación YOLO
  const [equipoDeteccion, setEquipoDeteccion] = useState<DeteccionYoloRequestEquipo>('A');
  const [confianza, setConfianza] = useState<number>(0.94);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [errorSimulacion, setErrorSimulacion] = useState<string | null>(null);

  // Seleccionar partido automáticamente si hay uno en juego o activo
  useEffect(() => {
    if (partidos.length > 0 && !partidoIdSeleccionado) {
      const enJuego = partidos.find((p) => p.estado === 'EN_JUEGO');
      setPartidoIdSeleccionado(enJuego ? enJuego.id : partidos[0].id);
    }
  }, [partidos, partidoIdSeleccionado]);

  // Si cambia la cancha, seleccionar la primera cámara
  useEffect(() => {
    if (camaras.length > 0 && !camaraIdSeleccionada) {
      setCamaraIdSeleccionada(camaras[0].id);
    }
  }, [camaras, camaraIdSeleccionada]);

  // Consulta en vivo del partido seleccionado con autorefresco cada 4 segundos
  const {
    data: partidoEnVivo,
    refetch: refetchPartido,
  } = useObtenerPorId1(partidoIdSeleccionado ?? 0, {
    query: {
      enabled: !!partidoIdSeleccionado,
      refetchInterval: 4000,
    },
  });

  // Eventos del partido en vivo
  const {
    data: eventos = [],
    refetch: refetchEventos,
  } = useListarPorPartido(partidoIdSeleccionado ?? 0, {
    query: {
      enabled: !!partidoIdSeleccionado,
      refetchInterval: 4000,
    },
  });

  // Clips del partido
  const {
    data: clips = [],
    refetch: refetchClips,
  } = useListarPorPartido1(partidoIdSeleccionado ?? 0, {
    query: {
      enabled: !!partidoIdSeleccionado,
      refetchInterval: 4000,
    },
  });

  // Mutación: Detección por Partido (usa JWT del Admin, sin pedir claveApi)
  const deteccionPartidoMutation = useProcesarDeteccionPartido({
    mutation: {
      onSuccess: (eventoResp) => {
        setMensajeExito(`¡Gol detectado por Visión Artificial! Evento #${eventoResp.id} generado exitosamente.`);
        setErrorSimulacion(null);
        refetchPartido();
        refetchEventos();
        refetchClips();
      },
      onError: (err) => {
        setErrorSimulacion(getApiErrorMessage(err, 'Error al procesar la detección YOLO por partido'));
      },
    },
  });

  // Mutación: Detección por Cámara (usa JWT del Admin)
  const deteccionCamaraMutation = useProcesarDeteccionCamara({
    mutation: {
      onSuccess: (eventoResp) => {
        setMensajeExito(`¡Detección procesada en Cámara #${camaraIdSeleccionada}! Evento generado: ${eventoResp.id}.`);
        setErrorSimulacion(null);
        refetchPartido();
        refetchEventos();
        refetchClips();
      },
      onError: (err) => {
        setErrorSimulacion(getApiErrorMessage(err, 'Error al procesar la detección YOLO por cámara'));
      },
    },
  });

  const handleDispararPorPartido = () => {
    if (!partidoIdSeleccionado) return;
    setMensajeExito(null);
    setErrorSimulacion(null);

    deteccionPartidoMutation.mutate({
      partidoId: partidoIdSeleccionado,
      data: {
        equipo: equipoDeteccion,
        confianza: Number(confianza) || 0.92,
        instante: new Date().toISOString(),
      },
    });
  };

  const handleDispararPorCamara = () => {
    if (!camaraIdSeleccionada) return;
    setMensajeExito(null);
    setErrorSimulacion(null);

    deteccionCamaraMutation.mutate({
      camaraId: camaraIdSeleccionada,
      data: {
        equipo: equipoDeteccion,
        confianza: Number(confianza) || 0.95,
        instante: new Date().toISOString(),
      },
    });
  };

  const isPending = deteccionPartidoMutation.isPending || deteccionCamaraMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado con Distintivo SIMULADO Prominente */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-navy-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turf-500/20 text-turf-400 text-xs font-bold border border-turf-500/30">
            <Radio className="w-3.5 h-3.5" />
            Visión Computacional & Deep Learning
          </div>

          {/* Insignia Obligatoria SIMULADO */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-limeAccent text-navy-950 font-black text-xs tracking-wider uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-navy-950" />
            <span>MÓDULO SIMULADO</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
          Demo de Ingesta YOLO & Visión Artificial
        </h1>
        <p className="mt-1 text-sm text-slate-300 max-w-2xl">
          Simula eventos de gol inferidos por redes neuronales convolucionales. El backend procesa la detección con tu sesión administrativa de JWT, actualiza el marcador y dispara la generación asíncrona del clip de jugada destacada.
        </p>
      </div>

      {/* Panel de Control y Configuración del Disparo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Controles del Simulador */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-turf-600" />
              <span>Parámetros de Detección</span>
            </h2>

            {/* Selector de Partido Activo */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Partido Objetivo:
              </label>
              <select
                value={partidoIdSeleccionado ?? ''}
                onChange={(e) => setPartidoIdSeleccionado(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-turf-500"
              >
                {partidos.length === 0 ? (
                  <option value="">No hay partidos disponibles</option>
                ) : (
                  partidos.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} • {p.nombreEquipoA} vs {p.nombreEquipoB} ({p.estado})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Selector de Equipo Anotador */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Adjudicar Gol al Equipo:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEquipoDeteccion('A')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                    equipoDeteccion === 'A'
                      ? 'border-turf-600 bg-turf-50 text-turf-900 ring-2 ring-turf-500/50'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {partidoEnVivo?.nombreEquipoA || 'Equipo A'}
                </button>
                <button
                  type="button"
                  onClick={() => setEquipoDeteccion('B')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                    equipoDeteccion === 'B'
                      ? 'border-turf-600 bg-turf-50 text-turf-900 ring-2 ring-turf-500/50'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {partidoEnVivo?.nombreEquipoB || 'Equipo B'}
                </button>
              </div>
            </div>

            {/* Nivel de Confianza YOLO */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Confianza del Modelo:</span>
                <span className="text-turf-700 font-mono">{(confianza * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.01"
                value={confianza}
                onChange={(e) => setConfianza(parseFloat(e.target.value))}
                className="w-full accent-turf-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block">
                Umbral mínimo aceptado por la red neuronal para validar gol: 80%
              </span>
            </div>

            {/* Botón Disparo Directo por Partido */}
            <Button
              variant="primary"
              size="md"
              className="w-full"
              disabled={isPending || !partidoIdSeleccionado}
              onClick={handleDispararPorPartido}
              icon={<Flame className="w-4 h-4" />}
            >
              {isPending ? 'Simulando Inferencia...' : 'Disparar Detección (Por Partido)'}
            </Button>

            {/* Opcional: Disparo por Cámara */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Vía Cámara RTSP
              </span>
              <div className="space-y-1">
                <select
                  value={canchaIdSeleccionada ?? ''}
                  onChange={(e) => {
                    const cid = e.target.value ? Number(e.target.value) : undefined;
                    setCanchaIdSeleccionada(cid);
                    setCamaraIdSeleccionada(undefined);
                  }}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">Seleccionar Cancha...</option>
                  {canchas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>

                <select
                  value={camaraIdSeleccionada ?? ''}
                  onChange={(e) => setCamaraIdSeleccionada(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="">Seleccionar Cámara...</option>
                  {camaras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.codigo} ({cam.resolucion || '1080p'})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                disabled={isPending || !camaraIdSeleccionada}
                onClick={handleDispararPorCamara}
                icon={<Video className="w-3.5 h-3.5" />}
              >
                Disparar por Cámara #{camaraIdSeleccionada || ''}
              </Button>
            </div>
          </Card>
        </div>

        {/* Columna Derecha: Marcador en Vivo, Eventos y Clips generados */}
        <div className="lg:col-span-2 space-y-4">
          {mensajeExito && (
            <div className="p-3.5 rounded-xl bg-turf-50 border border-turf-300 text-turf-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-turf-600 shrink-0" />
                <span>{mensajeExito}</span>
              </div>
              <button type="button" onClick={() => setMensajeExito(null)} className="font-bold text-turf-700">
                ✕
              </button>
            </div>
          )}

          {errorSimulacion && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorSimulacion}</span>
              </div>
              <button type="button" onClick={() => setErrorSimulacion(null)} className="font-bold text-red-500">
                ✕
              </button>
            </div>
          )}

          {/* Marcador En Vivo */}
          {partidoEnVivo ? (
            <Card className="p-6 border-turf-300 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-turf-500 animate-pulse" />
                  <span className="font-bold text-slate-800">
                    Telemetría en Vivo (Actualización cada 4s)
                  </span>
                </div>
                <StatusBadge status={partidoEnVivo.estado || 'EN_JUEGO'} />
              </div>

              {/* Display de Marcador */}
              <div className="py-6 flex items-center justify-center gap-6 sm:gap-12">
                <div className="text-center flex-1">
                  <span className="text-base sm:text-xl font-black text-navy-950 block truncate">
                    {partidoEnVivo.nombreEquipoA || 'Equipo A'}
                  </span>
                  <span className="text-xs font-semibold text-turf-700">Lado A</span>
                </div>

                <div className="px-5 py-3 bg-navy-950 text-white rounded-2xl shadow-lg border border-navy-800 flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black font-display text-turf-400">
                    {partidoEnVivo.golesEquipoA ?? 0}
                  </span>
                  <span className="text-slate-500 text-xl font-bold">:</span>
                  <span className="text-3xl sm:text-4xl font-black font-display text-turf-400">
                    {partidoEnVivo.golesEquipoB ?? 0}
                  </span>
                </div>

                <div className="text-center flex-1">
                  <span className="text-base sm:text-xl font-black text-navy-950 block truncate">
                    {partidoEnVivo.nombreEquipoB || 'Equipo B'}
                  </span>
                  <span className="text-xs font-semibold text-turf-700">Lado B</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 text-center py-6">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Selecciona un partido para visualizar el marcador en vivo.</p>
            </Card>
          )}

          {/* Línea de Tiempo de Eventos y Clips Generados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Eventos generados */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Eventos del Partido ({eventos.length})</span>
              </h3>

              {eventos.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Sin eventos registrados aún.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {eventos.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {ev.tipo} • Min {ev.minuto ?? 0}'
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {ev.anotadorNombre || 'Sin atribuir'} ({ev.equipo || 'A'})
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ev.estado === 'CONFIRMADO'
                            ? 'bg-turf-50 text-turf-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {ev.estado}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clips recortados */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Film className="w-4 h-4 text-turf-600" />
                <span>Clips de Video ({clips.length})</span>
              </h3>

              {clips.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Los clips se generan automáticamente tras registrarse un gol.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {clips.map((clip) => (
                    <div
                      key={clip.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                          Clip #{clip.id}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Duración: {clip.duracionSegundos ?? 15}s
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-turf-50 text-turf-700 border border-turf-200">
                        {clip.estado || 'LISTO'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
