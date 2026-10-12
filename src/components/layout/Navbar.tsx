import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Calendar,
  Trophy,
  MapPin,
  Shield,
  Activity,
  Grid
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { usuario, rol, estaAutenticado, logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCerrarSesion = () => {
    logout();
    navigate('/login');
    setMenuAbierto(false);
  };

  const getRolBadge = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return { label: 'Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'ADMIN_SEDE':
        return { label: 'Admin Sede', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'JUGADOR':
      default:
        return { label: 'Jugador', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const navLinks = (() => {
    if (!estaAutenticado) {
      return [
        { label: 'Sedes', to: '/sedes', icon: MapPin },
        { label: 'Canchas', to: '/canchas', icon: Grid },
      ];
    }

    if (rol === 'JUGADOR') {
      return [
        { label: 'Sedes', to: '/sedes', icon: MapPin },
        { label: 'Canchas', to: '/canchas', icon: Grid },
        { label: 'Mis Reservas', to: '/mis-reservas', icon: Calendar },
        { label: 'Mis Partidos', to: '/mis-partidos', icon: Activity },
        { label: 'Rankings', to: '/rankings', icon: Trophy },
        { label: 'Mi Perfil', to: '/perfil', icon: UserIcon },
      ];
    }

    if (rol === 'ADMIN_SEDE') {
      return [
        { label: 'Mis Sedes', to: '/admin/sedes', icon: MapPin },
        { label: 'Canchas & Tarifas', to: '/admin/canchas', icon: Grid },
        { label: 'Reservas de Sede', to: '/admin/reservas', icon: Calendar },
      ];
    }

    if (rol === 'ADMIN') {
      return [
        { label: 'Todas las Sedes', to: '/admin/sedes', icon: MapPin },
        { label: 'Gestión Canchas', to: '/admin/canchas', icon: Grid },
        { label: 'Rankings', to: '/rankings', icon: Trophy },
        { label: 'Panel Global', to: '/admin', icon: Shield },
      ];
    }

    return [];
  })();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y Nombre */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                ⚽
              </div>
              <span className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight">
                Reserva <span className="text-emerald-600">Canchas</span>
              </span>
            </Link>

            {/* Enlaces Desktop */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                      active
                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sección de usuario (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {estaAutenticado && usuario ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-800">
                    {usuario.nombre} {usuario.apellido}
                  </div>
                  <div className="flex justify-end">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        getRolBadge(usuario.rol).color
                      }`}
                    >
                      {getRolBadge(usuario.rol).label}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCerrarSesion}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-red-600 hover:border-red-300 transition"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-md transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-sm transition"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón menú móvil */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      {menuAbierto && (
        <div className="md:hidden border-t border-slate-200 bg-white px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3 text-slate-500" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-200">
            {estaAutenticado && usuario ? (
              <div className="px-3 py-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {usuario.nombre} {usuario.apellido}
                    </p>
                    <p className="text-xs text-slate-500">{usuario.correo}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      getRolBadge(usuario.rol).color
                    }`}
                  >
                    {getRolBadge(usuario.rol).label}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCerrarSesion}
                  className="w-full flex items-center justify-center px-4 py-2 border border-red-200 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuAbierto(false)}
                  className="w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
