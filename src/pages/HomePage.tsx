import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { Calendar, Shield, MapPin, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { usuario, rol, estaAutenticado } = useAuth();

  return (
    <div className="py-6 sm:py-12 space-y-8">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <span>⚽ Plataforma Oficial de Reserva Deportiva</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Encuentra tu cancha, reserva y juega al instante.
        </h1>
        <p className="text-base sm:text-lg text-slate-600">
          Gestiona reservas, consulta disponibilidad en tiempo real, organiza partidos y sigue tus estadísticas y highlights.
        </p>

        {estaAutenticado && usuario && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 inline-block text-left text-sm">
            <span className="font-bold">¡Bienvenido/a, {usuario.nombre}!</span> Has iniciado sesión como{' '}
            <span className="font-semibold underline uppercase">{rol}</span>.
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {!estaAutenticado ? (
            <>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow hover:bg-emerald-700 transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registro"
                className="px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Crear Cuenta
              </Link>
            </>
          ) : rol === 'JUGADOR' ? (
            <>
              <Link
                to="/canchas"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow hover:bg-emerald-700 transition"
              >
                Explorar Canchas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/mis-reservas"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Mis Reservas
              </Link>
            </>
          ) : rol === 'ADMIN_SEDE' ? (
            <>
              <Link
                to="/admin/sedes"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow hover:bg-blue-700 transition"
              >
                Gestionar Mis Sedes
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/admin/canchas"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
              >
                Canchas y Tarifas
              </Link>
            </>
          ) : (
            <Link
              to="/admin/sedes"
              className="inline-flex items-center px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm shadow hover:bg-purple-700 transition"
            >
              Panel de Administración
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Sedes y Canchas</h2>
          <p className="mt-2 text-sm text-slate-600">
            Fútbol 5, 7 y 11, básquetbol, vóley y pádel con filtros por disciplina, superficie y servicios.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Turnos en Tiempo Real</h2>
          <p className="mt-2 text-sm text-slate-600">
            Visualiza la disponibilidad exacta por franja horaria y tarifas especiales para horas pico y promociones.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Partidos y Estadísticas</h2>
          <p className="mt-2 text-sm text-slate-600">
            Marcador digital, highlights en video con sensores IoT y estadísticas acumuladas de goleadores y asistencias.
          </p>
        </div>
      </div>
    </div>
  );
};
