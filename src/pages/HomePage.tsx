import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useListarTodas, useListarTodas1 } from '@/api/endpoints';
import type { SedeResponse } from '@/api/model/sedeResponse';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  Search,
  MapPin,
  Activity,
  ArrowRight,
  ShieldCheck,
  Video,
  Trophy,
  SunMedium,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { usuario, estaAutenticado, rol } = useAuth();
  const navigate = useNavigate();

  const [deporteFiltro, setDeporteFiltro] = useState<string>('');
  const [sedeFiltro, setSedeFiltro] = useState<string>('');

  const { data: sedes = [] } = useListarTodas();
  const { data: canchas = [], isLoading: cargandoCanchas } = useListarTodas1({
    deporte: deporteFiltro ? (deporteFiltro as any) : undefined,
    sedeId: sedeFiltro ? Number(sedeFiltro) : undefined,
  });

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (deporteFiltro) params.set('deporte', deporteFiltro);
    if (sedeFiltro) params.set('sedeId', sedeFiltro);
    navigate(`/canchas?${params.toString()}`);
  };

  const DEMO_CANCHAS_HOME: CanchaResponse[] = [
    {
      id: 1,
      nombre: 'Cancha 1 - Fútbol 7 Césped Pro',
      deporte: 'FUTBOL',
      formato: 'FUTBOL_7',
      superficie: 'CESPED_SINTETICO' as any,
      techada: true,
      iluminacion: true,
      precioHora: 120,
      sedeNombre: 'Sede Central San Isidro',
    },
    {
      id: 2,
      nombre: 'Cancha 2 - Básquet Oficial FIBA',
      deporte: 'BASQUET',
      medioCampo: false,
      superficie: 'PARQUET' as any,
      techada: true,
      iluminacion: true,
      precioHora: 90,
      sedeNombre: 'Sede San Borja',
    },
    {
      id: 3,
      nombre: 'Cancha 3 - Pádel Panorámica Cristal',
      deporte: 'PADEL',
      paredesDeVidrio: true,
      superficie: 'CESPED_SINTETICO' as any,
      techada: true,
      iluminacion: true,
      precioHora: 110,
      sedeNombre: 'Sede Miraflores',
    },
  ];

  const canchasParaMostrar = canchas.length > 0 ? canchas : DEMO_CANCHAS_HOME;
  const canchasDestacadas = canchasParaMostrar.slice(0, 3);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. SECCIÓN PRINCIPAL (HERO DEPORTIVO) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-turf-950 text-white p-6 sm:p-12 lg:p-16 border border-navy-800 shadow-2xl">
        {/* Trama decorativa vectorial de campo de juego */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, #22c55e 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-turf-500/10 border border-turf-500/30 text-turf-300 text-xs font-semibold tracking-wide">
            <Activity className="w-3.5 h-3.5 text-limeAccent-400" />
            <span>Infraestructura deportiva conectada e inteligente</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
            Reserva tu cancha, juega y revive tus <span className="text-turf-400">mejores goles</span>.
          </h1>

          <p className="text-sm sm:text-lg text-navy-200 leading-relaxed max-w-2xl">
            Disponibilidad en tiempo real con bloqueo pesimista de turnos, telemetría IoT en arcos, detección inteligente y estadísticas deportivas acumuladas.
          </p>

          {/* Formulario de Búsqueda Rápida */}
          <form
            onSubmit={handleBuscar}
            className="p-3 sm:p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-navy-100 flex flex-col sm:flex-row items-center gap-3 text-navy-900"
          >
            <div className="w-full sm:flex-1 relative">
              <label htmlFor="hero-deporte" className="sr-only">
                Deporte
              </label>
              <select
                id="hero-deporte"
                value={deporteFiltro}
                onChange={(e) => setDeporteFiltro(e.target.value)}
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-navy-50 rounded-xl border border-navy-200 text-navy-900 focus:outline-none focus:ring-2 focus:ring-turf-600 font-medium"
              >
                <option value="">Todos los deportes</option>
                <option value="FUTBOL">Fútbol</option>
                <option value="BASKET">Básquet</option>
                <option value="VOLEY">Vóley</option>
                <option value="PADEL">Pádel</option>
              </select>
            </div>

            <div className="w-full sm:flex-1 relative">
              <label htmlFor="hero-sede" className="sr-only">
                Sede
              </label>
              <select
                id="hero-sede"
                value={sedeFiltro}
                onChange={(e) => setSedeFiltro(e.target.value)}
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-navy-50 rounded-xl border border-navy-200 text-navy-900 focus:outline-none focus:ring-2 focus:ring-turf-600 font-medium"
              >
                <option value="">Todas las sedes</option>
                {sedes.map((s: SedeResponse) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} {s.distrito ? `- ${s.distrito}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              variant="lime"
              size="md"
              className="w-full sm:w-auto shrink-0 font-bold"
              icon={<Search className="w-4 h-4" />}
            >
              Buscar Canchas
            </Button>
          </form>

          {/* Información del usuario autenticado */}
          {estaAutenticado && usuario && (
            <div className="pt-2 flex items-center gap-3 text-xs text-navy-300">
              <span className="w-2 h-2 rounded-full bg-turf-400" />
              <span>
                Sesión activa como <strong>{usuario.nombre} {usuario.apellido}</strong> ({rol})
              </span>
              <Link to="/mis-reservas" className="text-limeAccent-400 hover:underline font-semibold ml-2">
                Ver mis reservas →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 2. CÓMO FUNCIONA EN 3 PASOS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-turf-700 uppercase tracking-wider">
            Flujo Simple & Automatizado
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-navy-950">
            ¿Cómo funciona la plataforma?
          </h2>
          <p className="text-xs sm:text-sm text-navy-500">
            Reserva en menos de 2 minutos y disfruta de partidos monitorizados con registro oficial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="relative p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-turf-100 text-turf-800 flex items-center justify-center font-display font-extrabold text-xl">
              01
            </div>
            <h3 className="font-display font-bold text-lg text-navy-950">
              Explora y Elige Turno
            </h3>
            <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
              Filtra por deporte, sede, techada o iluminación. Consulta la disponibilidad horaria sin solapamientos.
            </p>
          </Card>

          <Card variant="elevated" className="relative p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-navy-100 text-navy-900 flex items-center justify-center font-display font-extrabold text-xl">
              02
            </div>
            <h3 className="font-display font-bold text-lg text-navy-950">
              Reserva & Pago Simulado
            </h3>
            <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
              Asegura tu horario con bloqueo pesimista en base de datos. Paga en soles de forma simulada y recibe tu código.
            </p>
          </Card>

          <Card variant="elevated" className="relative p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-limeAccent-400/30 text-limeAccent-600 flex items-center justify-center font-display font-extrabold text-xl">
              03
            </div>
            <h3 className="font-display font-bold text-lg text-navy-950">
              Juega, Goles & Highlights
            </h3>
            <p className="text-xs sm:text-sm text-navy-600 leading-relaxed">
              Inicia el partido al ingresar. Los sensores de arco y cámaras capturan goles, generan repeticiones y actualizan el ranking.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. CANCHAS DESTACADAS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-turf-700 uppercase tracking-wider">
              Instalaciones Verificadas
            </span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-navy-950">
              Canchas Destacadas
            </h2>
          </div>
          <Link to="/canchas">
            <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
              Ver todas las canchas
            </Button>
          </Link>
        </div>

        {cargandoCanchas ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : canchasDestacadas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {canchasDestacadas.map((cancha: CanchaResponse) => (
              <Card key={cancha.id} variant="elevated" className="flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-turf-100 text-turf-800 border border-turf-200">
                      {cancha.deporte}
                    </span>
                    <span className="text-sm font-bold text-turf-700">
                      S/. {(cancha.precioHora || cancha.precioNormal || 0).toFixed(2)} / hora
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-base text-navy-950">
                      {cancha.nombre}
                    </h4>
                    <p className="text-xs text-navy-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-navy-400" />
                      <span>{cancha.sedeNombre || 'Sede Principal'}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-100 text-xs text-navy-600">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-turf-600" />
                      <span>{cancha.superficie || 'Césped sintético'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                      <span>{cancha.techada ? 'Techada' : 'Al aire libre'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-navy-50/60 border-t border-navy-100">
                  <Link to={`/canchas/${cancha.id}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      Ver Disponibilidad & Horarios
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-navy-200">
            <p className="text-navy-500 text-sm">No se encontraron canchas con los filtros actuales.</p>
          </div>
        )}
      </section>

      {/* 4. SECCIÓN HIGHLIGHTS & TECNOLOGÍA IOT */}
      <section className="rounded-3xl bg-navy-900 text-white p-8 sm:p-12 border border-navy-800 shadow-xl space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turf-500/20 text-turf-300 text-xs font-semibold">
            <Video className="w-3.5 h-3.5" />
            <span>Sistema Inteligente de Goles y Video</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Tecnología deportiva al servicio del jugador
          </h2>
          <p className="text-xs sm:text-sm text-navy-300 leading-relaxed">
            Revive tus jugadas maestras al instante. Con cada gol confirmado, el sistema genera un clip procesado listo para compartir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-navy-950/70 border border-navy-800 space-y-2">
            <Activity className="w-6 h-6 text-turf-400" />
            <h4 className="font-display font-bold text-sm text-white">Telemetría de Arco</h4>
            <p className="text-xs text-navy-400">
              Sensores infrarrojos y piezoeléctricos detectan el impacto y cruce del balón en línea de meta.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950/70 border border-navy-800 space-y-2">
            <Video className="w-6 h-6 text-limeAccent-400" />
            <h4 className="font-display font-bold text-sm text-white">Clips Automáticos</h4>
            <p className="text-xs text-navy-400">
              Generación de repeticiones mediante FFmpeg (-15s previo y +8s posterior al evento de gol).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950/70 border border-navy-800 space-y-2">
            <ShieldCheck className="w-6 h-6 text-sky-400" />
            <h4 className="font-display font-bold text-sm text-white">Arbitraje & Atribución</h4>
            <p className="text-xs text-navy-400">
              Los jugadores u organizadores pueden confirmar el gol y atribuir autor y asistente con fecha límite.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-950/70 border border-navy-800 space-y-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h4 className="font-display font-bold text-sm text-white">Rankings Oficiales</h4>
            <p className="text-xs text-navy-400">
              Métricas consolidadas de goleadores, asistencias y victorias acumuladas en toda la comunidad.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
