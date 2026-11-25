import React, { useState } from 'react';
import {
  useListarTodas,
  useListarTodas1,
  useListarPorCancha,
  useRegistrarSensor,
  useRegistrarCamara,
  useDesactivar,
} from '@/api/endpoints';
import type { DispositivoRegistroResponse } from '@/api/model/dispositivoRegistroResponse';
import type { RegistroSensorRequestUbicacion } from '@/api/model/registroSensorRequestUbicacion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Cpu,
  Video,
  Radio,
  WifiOff,
  Copy,
  Check,
  AlertTriangle,
  Building2,
  Grid,
  PowerOff,
} from 'lucide-react';

export const AdminDispositivosPage: React.FC = () => {
  // 1. Sedes y Canchas para contextualizar los dispositivos
  const { data: sedes = [] } = useListarTodas();
  const [sedeSeleccionadaId, setSedeSeleccionadaId] = useState<number | undefined>(undefined);

  const { data: canchas = [] } = useListarTodas1({
    sedeId: sedeSeleccionadaId,
  });

  const [canchaSeleccionadaId, setCanchaSeleccionadaId] = useState<number | undefined>(undefined);

  // Seleccionar automáticamente la primera cancha si no hay ninguna activa
  React.useEffect(() => {
    if (canchas.length > 0 && !canchaSeleccionadaId) {
      setCanchaSeleccionadaId(canchas[0].id);
    }
  }, [canchas, canchaSeleccionadaId]);

  // 2. Dispositivos de la cancha elegida
  const {
    data: dispositivos = [],
    isLoading: cargandoDispositivos,
    refetch: refetchDispositivos,
  } = useListarPorCancha(canchaSeleccionadaId ?? 0);

  // Modales de Registro
  const [modalRegistroTipo, setModalRegistroTipo] = useState<'SENSOR' | 'CAMARA' | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState<DispositivoRegistroResponse | null>(null);
  const [copiadoClave, setCopiadoClave] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  // Estados de formularios
  const [codigoSensor, setCodigoSensor] = useState('');
  const [ubicacionSensor, setUbicacionSensor] = useState<RegistroSensorRequestUbicacion>('ARCO_A');
  const [sensibilidad, setSensibilidad] = useState<number>(85);

  const [codigoCamara, setCodigoCamara] = useState('');
  const [urlStream, setUrlStream] = useState('');
  const [resolucion, setResolucion] = useState('1920x1080');
  const [fps, setFps] = useState(30);

  // Mutaciones de endpoints oficiales
  const registrarSensorMutation = useRegistrarSensor({
    mutation: {
      onSuccess: (resp) => {
        setRegistroExitoso(resp);
        setModalRegistroTipo(null);
        setErrorAccion(null);
        refetchDispositivos();
        setCodigoSensor('');
      },
      onError: (err) => {
        setErrorAccion(getApiErrorMessage(err, 'No se pudo registrar el sensor'));
      },
    },
  });

  const registrarCamaraMutation = useRegistrarCamara({
    mutation: {
      onSuccess: (resp) => {
        setRegistroExitoso(resp);
        setModalRegistroTipo(null);
        setErrorAccion(null);
        refetchDispositivos();
        setCodigoCamara('');
        setUrlStream('');
      },
      onError: (err) => {
        setErrorAccion(getApiErrorMessage(err, 'No se pudo registrar la cámara'));
      },
    },
  });

  const desactivarMutation = useDesactivar({
    mutation: {
      onSuccess: () => {
        refetchDispositivos();
      },
      onError: (err) => {
        setErrorAccion(getApiErrorMessage(err, 'No se pudo desactivar el dispositivo'));
      },
    },
  });

  const handleCrearSensor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canchaSeleccionadaId || !codigoSensor.trim()) return;
    setErrorAccion(null);

    registrarSensorMutation.mutate({
      canchaId: canchaSeleccionadaId,
      data: {
        codigo: codigoSensor.trim().toUpperCase(),
        ubicacion: ubicacionSensor,
        sensibilidad: Number(sensibilidad) || 80,
      },
    });
  };

  const handleCrearCamara = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canchaSeleccionadaId || !codigoCamara.trim()) return;
    setErrorAccion(null);

    registrarCamaraMutation.mutate({
      canchaId: canchaSeleccionadaId,
      data: {
        codigo: codigoCamara.trim().toUpperCase(),
        urlStream: urlStream.trim() || undefined,
        resolucion: resolucion || '1920x1080',
        fps: Number(fps) || 30,
      },
    });
  };

  const handleCopiarClave = () => {
    if (registroExitoso?.claveApi) {
      navigator.clipboard.writeText(registroExitoso.claveApi);
      setCopiadoClave(true);
      setTimeout(() => setCopiadoClave(false), 2500);
    }
  };

  const handleDesactivar = (dispositivoId?: number) => {
    if (!dispositivoId) return;
    if (window.confirm('¿Deseas inhabilitar este dispositivo IoT? Dejará de procesar eventos de arco o transmisión.')) {
      desactivarMutation.mutate({ id: dispositivoId });
    }
  };

  const canchaActual = canchas.find((c) => c.id === canchaSeleccionadaId);

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-navy-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turf-500/20 text-turf-400 text-xs font-bold border border-turf-500/30 mb-3">
          <Radio className="w-3.5 h-3.5" />
          Infraestructura IoT & Cámaras Deportivas
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Gestión de Dispositivos de Cancha
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              Monitorea en tiempo real el estado de sensores piezoeléctricos de arco, cámaras RTSP y telemetría de latidos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              disabled={!canchaSeleccionadaId}
              onClick={() => {
                setErrorAccion(null);
                setModalRegistroTipo('SENSOR');
              }}
              icon={<Cpu className="w-4 h-4" />}
            >
              Nuevo Sensor
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!canchaSeleccionadaId}
              onClick={() => {
                setErrorAccion(null);
                setModalRegistroTipo('CAMARA');
              }}
              icon={<Video className="w-4 h-4" />}
            >
              Nueva Cámara
            </Button>
          </div>
        </div>
      </div>

      {/* Selectores de Sede y Cancha */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Sede Deportiva:</span>
            </label>
            <select
              value={sedeSeleccionadaId ?? ''}
              onChange={(e) => {
                const sid = e.target.value ? Number(e.target.value) : undefined;
                setSedeSeleccionadaId(sid);
                setCanchaSeleccionadaId(undefined);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-turf-500"
            >
              <option value="">Todas las sedes</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.distrito})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Grid className="w-4 h-4 text-slate-400" />
              <span>Cancha para Telemetría:</span>
            </label>
            <select
              value={canchaSeleccionadaId ?? ''}
              onChange={(e) => setCanchaSeleccionadaId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-turf-500"
            >
              {canchas.length === 0 ? (
                <option value="">No hay canchas registradas en esta sede</option>
              ) : (
                canchas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} • {c.superficie || 'Cancha'}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </Card>

      {errorAccion && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorAccion}</span>
          </div>
          <button type="button" onClick={() => setErrorAccion(null)} className="font-bold text-red-500">
            ✕
          </button>
        </div>
      )}

      {/* Listado de Dispositivos */}
      {cargandoDispositivos ? (
        <LoadingSpinner mensaje="Consultando telemetría de dispositivos..." />
      ) : dispositivos.length === 0 ? (
        <Card className="p-6 text-center py-12">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Sin dispositivos instalados en {canchaActual?.nombre || 'esta cancha'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Instala sensores de arco para detectar goles automáticamente o cámaras para captura de clips deportivos.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dispositivos.map((disp) => {
            const esSensor = disp.tipo === 'SENSOR_ARCO' || !!disp.ubicacion;
            return (
              <div
                key={disp.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 transition ${
                  disp.enLinea
                    ? 'border-turf-300 ring-1 ring-turf-200/50'
                    : 'border-slate-200'
                }`}
              >
                {/* Cabecera Tarjeta */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        esSensor
                          ? 'bg-turf-50 text-turf-700'
                          : 'bg-navy-50 text-navy-700'
                      }`}
                    >
                      {esSensor ? <Cpu className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-800 block">
                        {disp.codigo}
                      </span>
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                        {esSensor ? 'Sensor de Arco' : 'Cámara Deportiva'}
                      </span>
                    </div>
                  </div>

                  {/* Estado En Línea */}
                  <div>
                    {disp.enLinea ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-turf-50 text-turf-700 border border-turf-200">
                        <span className="w-2 h-2 rounded-full bg-turf-500 animate-pulse" />
                        En Línea
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        <WifiOff className="w-3 h-3 text-slate-400" />
                        Desconectado
                      </span>
                    )}
                  </div>
                </div>

                {/* Parámetros Técnicos */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {esSensor ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ubicación Arco:</span>
                        <strong className="text-slate-800">{disp.ubicacion || 'No asignada'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Sensibilidad:</span>
                        <strong className="text-slate-800">{disp.sensibilidad ?? 80}%</strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Resolución:</span>
                        <strong className="text-slate-800">{disp.resolucion || '1080p'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">FPS / Flujo:</span>
                        <strong className="text-slate-800">{disp.fps ?? 30} fps</strong>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">Último latido:</span>
                    <span className="text-slate-700 font-mono">
                      {disp.ultimoLatido ? new Date(disp.ultimoLatido).toLocaleTimeString('es-PE') : 'Sin registros'}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span
                    className={`text-[11px] font-bold ${
                      disp.activo ? 'text-turf-700' : 'text-red-700'
                    }`}
                  >
                    {disp.activo ? 'Dispositivo Habilitado' : 'Inhabilitado'}
                  </span>

                  {disp.activo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDesactivar(disp.id)}
                      icon={<PowerOff className="w-3.5 h-3.5 text-red-500" />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                    >
                      Inhabilitar
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Registro Sensor */}
      <Modal
        isOpen={modalRegistroTipo === 'SENSOR'}
        onClose={() => setModalRegistroTipo(null)}
        title="Registrar Sensor de Arco IoT"
        size="md"
      >
        <form onSubmit={handleCrearSensor} className="space-y-4">
          <p className="text-xs text-slate-500">
            Registra un sensor físico o simulado para la cancha <strong>{canchaActual?.nombre}</strong>. Se generará una clave API de acceso único.
          </p>

          <Input
            label="Código Identificador del Sensor"
            placeholder="Ej: SENSOR-ARCO-NORTE-01"
            value={codigoSensor}
            onChange={(e) => setCodigoSensor(e.target.value)}
            required
          />

          <Select
            label="Ubicación del Arco"
            value={ubicacionSensor}
            onChange={(e) => setUbicacionSensor(e.target.value as RegistroSensorRequestUbicacion)}
            options={[
              { value: 'ARCO_A', label: 'Arco Lado A' },
              { value: 'ARCO_B', label: 'Arco Lado B' },
            ]}
          />

          <Input
            label="Sensibilidad de Detección (0 - 100)"
            type="number"
            min={1}
            max={100}
            value={sensibilidad}
            onChange={(e) => setSensibilidad(Number(e.target.value))}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalRegistroTipo(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={registrarSensorMutation.isPending}
              icon={<Cpu className="w-4 h-4" />}
            >
              {registrarSensorMutation.isPending ? 'Registrando...' : 'Generar Clave y Registrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Registro Cámara */}
      <Modal
        isOpen={modalRegistroTipo === 'CAMARA'}
        onClose={() => setModalRegistroTipo(null)}
        title="Registrar Cámara de Grabación y YOLO"
        size="md"
      >
        <form onSubmit={handleCrearCamara} className="space-y-4">
          <p className="text-xs text-slate-500">
            Registra una cámara para streaming y visión computacional en <strong>{canchaActual?.nombre}</strong>.
          </p>

          <Input
            label="Código de la Cámara"
            placeholder="Ej: CAM-C1-LATERAL-01"
            value={codigoCamara}
            onChange={(e) => setCodigoCamara(e.target.value)}
            required
          />

          <Input
            label="URL RTSP o HTTP de Transmisión (Opcional)"
            placeholder="rtsp://192.168.1.120:554/live/ch0"
            value={urlStream}
            onChange={(e) => setUrlStream(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Resolución"
              value={resolucion}
              onChange={(e) => setResolucion(e.target.value)}
              options={[
                { value: '1920x1080', label: 'Full HD 1080p' },
                { value: '1280x720', label: 'HD 720p' },
                { value: '3840x2160', label: '4K Ultra HD' },
              ]}
            />
            <Input
              label="Fotogramas por Segundo (FPS)"
              type="number"
              min={15}
              max={60}
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setModalRegistroTipo(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={registrarCamaraMutation.isPending}
              icon={<Video className="w-4 h-4" />}
            >
              {registrarCamaraMutation.isPending ? 'Registrando...' : 'Registrar Cámara'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Clave API Única */}
      {registroExitoso && (
        <Modal
          isOpen={!!registroExitoso}
          onClose={() => setRegistroExitoso(null)}
          title="Credenciales del Dispositivo Generadas"
          size="md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>¡Guarda esta clave API ahora mismo!</span>
              </div>
              <p>
                Por razones de seguridad criptográfica, esta clave se muestra <strong>una única vez</strong> en texto plano y no podrá recuperarse posteriormente.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Código Asignado:</label>
              <input
                type="text"
                readOnly
                value={registroExitoso.codigo || ''}
                className="w-full text-xs font-mono font-bold bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Clave API Generada:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={registroExitoso.claveApi || ''}
                  className="w-full text-xs font-mono font-bold bg-turf-50/70 p-2.5 rounded-lg border border-turf-300 text-turf-900 select-all"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopiarClave}
                  icon={copiadoClave ? <Check className="w-4 h-4 text-turf-600" /> : <Copy className="w-4 h-4" />}
                >
                  {copiadoClave ? 'Copiada' : 'Copiar'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" size="md" onClick={() => setRegistroExitoso(null)}>
                Entendido, he guardado la clave
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
