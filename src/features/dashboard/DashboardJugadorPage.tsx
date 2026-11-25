import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import {
  useListarMisReservas,
  useListarMisPartidos,
  useObtenerEstadisticas,
  useListarTodas,
} from '@/api/endpoints';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import { ModalPago } from '@/features/reservas/components/ModalPago';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  CreditCard,
  ArrowRight,
  PlusCircle,
  Activity,
  Flame,
  CheckCircle2,
  Users,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const DashboardJugadorPage: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [reservaParaPagar, setReservaParaPagar] = useState<ReservaResponse | null>(null);

  // Consultas principales del panel de jugador
  const {
    data: reservas = [],
    isLoading: cargandoReservas,
    refetch: refetchReservas,
  } = useListarMisReservas();

  const {
    data: partidos = [],
    isLoading: cargandoPartidos,
  } = useListarMisPartidos();

  const {
    data: sedes = [],
  } = useListarTodas();

  const primeraSedeId = sedes[0]?.id;

  const {
    data: estadisticas,
  } = useObtenerEstadisticas(
    usuario?.id ?? 0,
    primeraSedeId ? { sedeId: primeraSedeId } : undefined,
    {
      query: {
        enabled: !!usuario?.id,
      },
    }
  );

  // Filtros de lógica de negocio
  // 1. Próxima reserva activa (orden ascendente por fecha/hora)
  const ahora = new Date().toISOString().split('T')[0];
  const reservasFuturas = reservas
    .filter((r) => r.estado !== 'CANCELADA')
    .sort((a, b) => {
      const fechaA = `${a.fecha}T${a.horaInicio || '00:00'}`;
      const fechaB = `${b.fecha}T${b.horaInicio || '00:00'}`;
      return fechaA.localeCompare(fechaB);
    });

  const proximaReserva = reservasFuturas.find((r) => (r.fecha || '') >= ahora) || reservasFuturas[0];

  // 2. Pagos pendientes (estado PENDIENTE o pagada: false)
  const pagosPendientes = reservas.filter(
    (r) => r.estado === 'PENDIENTE' || (!r.pagada && r.estado !== 'CANCELADA')
  );

  // 3. Partidos recientes
  const partidosRecientes = [...partidos].slice(0, 5);

  const isLoading = cargandoReservas || cargandoPartidos;

  if (isLoading) {
    return <LoadingSpinner mensaje="Cargando tu panel deportivo..." className="py-20" />;
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Saludo y bienvenida */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-navy-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-turf-500/20 text-turf-400 text-xs font-bold border border-turf-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Panel del Jugador CanchaYa
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              ¡Hola, {usuario?.nombre || 'Goleador'}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Revisa tus reservas activas, completa pagos pendientes y analiza tu rendimiento en la cancha.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/canchas">
              <Button variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
                Reservar Cancha
              </Button>
            </Link>
            <Link to="/mis-reservas">
              <Button variant="secondary" size="md">
                Mis Reservas
              </Button>
            </Link>
          </div>
        </div>

        {/* Círculo decorativo */}
        <div className="absolute right-0 -bottom-16 w-64 h-64 bg-turf-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Métricas rápidas del jugador */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-turf-50 text-turf-600 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Mis Reservas
            </span>
            <span className="text-2xl font-black text-navy-950 font-display">
              {reservas.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-navy-50 text-navy-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Partidos
            </span>
            <span className="text-2xl font-black text-navy-950 font-display">
              {partidos.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Goles Anotados
            </span>
            <span className="text-2xl font-black text-navy-950 font-display">
              {estadisticas?.goles ?? 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Victorias
            </span>
            <span className="text-2xl font-black text-navy-950 font-display">
              {estadisticas?.victorias ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Central: Próxima Reserva y Pagos Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1 y 2: Próxima Reserva Destacada */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-turf-600" />
              <span>Próxima Reserva</span>
            </h2>
            <Link to="/mis-reservas" className="text-xs font-bold text-turf-700 hover:text-turf-800 flex items-center gap-1">
              <span>Ver todas</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {proximaReserva ? (
            <Card className="p-6 border-turf-200/80 bg-gradient-to-br from-white to-turf-50/20">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Reserva #{proximaReserva.id}
                    </span>
                    <StatusBadge status={proximaReserva.estado || 'CONFIRMADA'} />
                    {proximaReserva.pagada ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-turf-700 bg-turf-50 px-2 py-0.5 rounded-full border border-turf-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Pagado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Pago Pendiente
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-navy-950 font-display">
                    {proximaReserva.canchaNombre || `Cancha #${proximaReserva.canchaId}`}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Reserva Deportiva CanchaYa
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-slate-500 block">Total</span>
                  <span className="text-2xl font-black text-turf-700 font-display">
                    S/. {Number(proximaReserva.precioTotal || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs text-slate-600">
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Calendar className="w-5 h-5 text-turf-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">{proximaReserva.fecha}</span>
                    <span className="text-slate-500">Fecha del encuentro</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <Clock className="w-5 h-5 text-turf-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">
                      {proximaReserva.horaInicio} - {proximaReserva.horaFin}
                    </span>
                    <span className="text-slate-500">Horario programado</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {proximaReserva.pagada
                    ? 'Tu cancha está asegurada. ¡Invita a tus compañeros y prepara el partido!'
                    : 'Recuerda completar el pago para confirmar tu turno en la sede.'}
                </div>

                <div className="flex items-center gap-2">
                  {!proximaReserva.pagada && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setReservaParaPagar(proximaReserva)}
                      icon={<CreditCard className="w-4 h-4" />}
                    >
                      Pagar Reserva
                    </Button>
                  )}
                  <Link to="/mis-reservas">
                    <Button variant="secondary" size="sm">
                      Gestionar
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No tienes reservas activas</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Elige tu cancha favorita, selecciona el horario que prefieras y asegura tu pichanga en segundos.
              </p>
              <Link to="/canchas">
                <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                  Explorar Canchas
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Columna 3: Pagos Pendientes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <span>Pagos Pendientes</span>
            </h2>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {pagosPendientes.length}
            </span>
          </div>

          {pagosPendientes.length > 0 ? (
            <div className="space-y-3">
              {pagosPendientes.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        {res.canchaNombre || 'Cancha'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {res.fecha} • {res.horaInicio}
                      </span>
                    </div>
                    <span className="text-sm font-black text-navy-950">
                      S/. {Number(res.precioTotal || 0).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => setReservaParaPagar(res)}
                    icon={<CreditCard className="w-3.5 h-3.5" />}
                  >
                    Pagar S/. {Number(res.precioTotal || 0).toFixed(2)}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-4 text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-turf-600 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-700 block">¡Al día con tus pagos!</span>
              <p className="text-[11px] text-slate-500 mt-1">
                No tienes reservas con pagos pendientes de procesar.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Sección de Partidos Recientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-navy-950 flex items-center gap-2">
            <Activity className="w-5 h-5 text-turf-600" />
            <span>Mis Partidos Recientes</span>
          </h2>
          <Link to="/mis-partidos" className="text-xs font-bold text-turf-700 hover:text-turf-800 flex items-center gap-1">
            <span>Ver historial completo</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {partidosRecientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partidosRecientes.map((partido) => (
              <div
                key={partido.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-turf-300 transition space-y-3 cursor-pointer"
                onClick={() => navigate(`/partidos/${partido.id}`)}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Encuentro CanchaYa</span>
                  <StatusBadge status={partido.estado || 'PROGRAMADO'} />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-center">
                  <div className="flex-1 truncate font-bold text-xs text-navy-900">
                    {partido.nombreEquipoA || 'Equipo A'}
                  </div>
                  <div className="px-3 py-1 bg-navy-950 text-white font-black text-sm rounded mx-2 font-display">
                    {partido.golesEquipoA ?? 0} - {partido.golesEquipoB ?? 0}
                  </div>
                  <div className="flex-1 truncate font-bold text-xs text-navy-900">
                    {partido.nombreEquipoB || 'Equipo B'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-mono">
                    Partido #{partido.id}
                  </span>
                  <span className="text-turf-700 font-bold flex items-center gap-0.5">
                    <span>Ver detalle</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-4 text-center py-8">
            <Trophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <span className="text-xs font-bold text-slate-700 block">Sin partidos registrados aún</span>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Cuando confirmes tu reserva o te unas a un partido con enlace de invitación, aparecerá aquí con estadísticas en vivo y clips.
            </p>
          </Card>
        )}
      </div>

      {/* Modal de Pago Simulado */}
      {reservaParaPagar && (
        <ModalPago
          reserva={reservaParaPagar}
          isOpen={!!reservaParaPagar}
          onClose={() => setReservaParaPagar(null)}
          onSuccess={() => {
            setReservaParaPagar(null);
            refetchReservas();
          }}
        />
      )}
    </div>
  );
};
