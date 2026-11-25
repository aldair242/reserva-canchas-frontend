import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
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
  Grid,
  UserCheck,
  Radio,
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
        return { label: 'Administrador Global', color: 'bg-navy-800 text-navy-100 border-navy-700' };
      case 'ADMIN_SEDE':
        return { label: 'Admin de Sede', color: 'bg-turf-900/60 text-turf-200 border-turf-700/60' };
      case 'JUGADOR':
      default:
        return { label: 'Jugador Oficial', color: 'bg-turf-800 text-turf-100 border-turf-700' };
    }
  };

  const navLinks = (() => {
    if (!estaAutenticado) {
      return [
        { label: 'Sedes', to: '/sedes', icon: MapPin },
        { label: 'Canchas', to: '/canchas', icon: Grid },
        { label: 'Rankings', to: '/rankings', icon: Trophy },
      ];
    }

    if (rol === 'JUGADOR') {
      return [
        { label: 'Mi Panel', to: '/dashboard', icon: Activity },
        { label: 'Explorar Canchas', to: '/canchas', icon: Grid },
        { label: 'Sedes', to: '/sedes', icon: MapPin },
        { label: 'Mis Reservas', to: '/mis-reservas', icon: Calendar },
        { label: 'Mis Partidos', to: '/mis-partidos', icon: Trophy },
        { label: 'Rankings', to: '/rankings', icon: Trophy },
        { label: 'Mi Perfil', to: '/perfil', icon: UserIcon },
      ];
    }

    if (rol === 'ADMIN_SEDE') {
      return [
        { label: 'Mis Sedes', to: '/admin/sedes', icon: MapPin },
        { label: 'Canchas & Tarifas', to: '/admin/canchas', icon: Grid },
        { label: 'Reservas de Sede', to: '/admin/reservas', icon: Calendar },
        { label: 'Dispositivos IoT', to: '/admin/dispositivos', icon: Activity },
        { label: 'Demo YOLO (IA)', to: '/admin/yolo', icon: Radio },
      ];
    }

    if (rol === 'ADMIN') {
      return [
        { label: 'Panel Global', to: '/admin', icon: Shield },
        { label: 'Sedes', to: '/admin/sedes', icon: MapPin },
        { label: 'Canchas', to: '/admin/canchas', icon: Grid },
        { label: 'Admins de Sede', to: '/admin/usuarios', icon: UserCheck },
        { label: 'Dispositivos IoT', to: '/admin/dispositivos', icon: Activity },
        { label: 'Rankings', to: '/rankings', icon: Trophy },
        { label: 'Demo YOLO (IA)', to: '/admin/yolo', icon: Radio },
      ];
    }

    return [];
  })();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-navy-950 border-b border-navy-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo y Marca */}
          <Link
            to="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-turf-400 rounded-xl p-1"
          >
            <BrandLogo isDark={true} />
          </Link>

          {/* Navegación de Escritorio */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Navegación principal">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                    active
                      ? 'bg-turf-700/80 text-white border border-turf-600'
                      : 'text-navy-200 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-limeAccent-400' : 'text-navy-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Acciones de Usuario (Escritorio) */}
          <div className="hidden lg:flex items-center gap-3">
            {!estaAutenticado ? (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-navy-200 hover:text-white hover:bg-navy-900">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button variant="lime" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-3 border-l border-navy-800">
                <div className="text-right">
                  <p className="text-xs font-bold text-white truncate max-w-[140px]">
                    {usuario?.nombre} {usuario?.apellido}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        getRolBadge(rol || '').color
                      }`}
                    >
                      {getRolBadge(rol || '').label}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCerrarSesion}
                  className="bg-navy-900 border-navy-700 text-navy-300 hover:text-rose-400 hover:border-rose-900/60"
                  icon={<LogOut className="w-3.5 h-3.5" />}
                  aria-label="Cerrar sesión"
                >
                  Salir
                </Button>
              </div>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2 rounded-xl text-navy-300 hover:text-white hover:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-turf-500"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {menuAbierto && (
        <div className="lg:hidden border-t border-navy-800 bg-navy-950 px-4 pt-3 pb-6 space-y-3">
          {estaAutenticado && (
            <div className="p-3 rounded-2xl bg-navy-900 border border-navy-800 mb-2">
              <p className="text-xs font-bold text-white">
                {usuario?.nombre} {usuario?.apellido}
              </p>
              <p className="text-[11px] text-navy-400 mt-0.5">{usuario?.correo}</p>
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-2 ${
                  getRolBadge(rol || '').color
                }`}
              >
                {getRolBadge(rol || '').label}
              </span>
            </div>
          )}

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuAbierto(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    active
                      ? 'bg-turf-700 text-white'
                      : 'text-navy-200 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-limeAccent-400' : 'text-navy-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-navy-800">
            {!estaAutenticado ? (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMenuAbierto(false)}>
                  <Button variant="outline" size="sm" className="w-full bg-navy-900 border-navy-700 text-white">
                    Ingresar
                  </Button>
                </Link>
                <Link to="/registro" onClick={() => setMenuAbierto(false)}>
                  <Button variant="lime" size="sm" className="w-full">
                    Registro
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={handleCerrarSesion}
                className="w-full"
                icon={<LogOut className="w-4 h-4" />}
              >
                Cerrar Sesión
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
