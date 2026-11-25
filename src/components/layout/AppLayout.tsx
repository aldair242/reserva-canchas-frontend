import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Shield, Activity, Calendar } from 'lucide-react';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-navy-50 text-navy-900">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="bg-navy-950 border-t border-navy-800 text-navy-300 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-navy-800 text-xs sm:text-sm">
            {/* Columna Marca */}
            <div className="space-y-3 md:col-span-1">
              <BrandLogo isDark={true} />
              <p className="text-navy-400 text-xs leading-relaxed">
                Plataforma integral de gestión de sedes, reserva inteligente de canchas, telemetría IoT y estadísticas oficiales de juego.
              </p>
            </div>

            {/* Accesos Rápidos */}
            <div className="space-y-2">
              <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                Explorar
              </h5>
              <ul className="space-y-1.5 text-navy-400 text-xs">
                <li>
                  <Link to="/sedes" className="hover:text-turf-400 transition-colors">
                    Sedes Deportivas
                  </Link>
                </li>
                <li>
                  <Link to="/canchas" className="hover:text-turf-400 transition-colors">
                    Catálogo de Canchas
                  </Link>
                </li>
                <li>
                  <Link to="/rankings" className="hover:text-turf-400 transition-colors">
                    Rankings Oficiales
                  </Link>
                </li>
              </ul>
            </div>

            {/* Módulos Deportivos */}
            <div className="space-y-2">
              <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                Tecnología
              </h5>
              <ul className="space-y-1.5 text-navy-400 text-xs">
                <li className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-turf-400" />
                  <span>Sensores de Arco IoT</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-limeAccent-400" />
                  <span>Inferencia YOLO Simulado</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-navy-400" />
                  <span>Bloqueo Pesimista de Turnos</span>
                </li>
              </ul>
            </div>

            {/* Horario y Moneda */}
            <div className="space-y-2">
              <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                Configuración
              </h5>
              <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 text-[11px] space-y-1">
                <p className="text-navy-300">
                  Zona horaria: <span className="font-semibold text-white">America/Lima (UTC-5)</span>
                </p>
                <p className="text-navy-300">
                  Moneda: <span className="font-semibold text-turf-400">Soles Peruanos (S/.)</span>
                </p>
                <p className="text-navy-400 text-[10px] mt-1 pt-1 border-t border-navy-800">
                  API: Spring Boot (v1.0.0)
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-500 gap-3">
            <p>&copy; {new Date().getFullYear()} CanchaYa. Proyecto académico de ingeniería.</p>
            <p className="text-navy-400">Entrega Final · React 18 + TypeScript + Spring Boot</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
