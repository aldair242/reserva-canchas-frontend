import React from 'react';
import { Link } from 'react-router-dom';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  SunMedium,
  Zap,
  MapPin,
  Calendar,
} from 'lucide-react';

interface CanchaCardProps {
  cancha: CanchaResponse;
}

export const CanchaCard: React.FC<CanchaCardProps> = ({ cancha }) => {
  // Configuración de imagen deportiva ilustrativa sobria según el deporte
  const getDeporteVisual = (dep?: string) => {
    switch (dep) {
      case 'FUTBOL':
        return {
          label: 'Fútbol',
          badgeBg: 'bg-turf-100 text-turf-900 border-turf-200',
          grad: 'from-emerald-950 via-turf-950 to-navy-950',
          accent: 'border-l-4 border-turf-600',
        };
      case 'BASQUET':
        return {
          label: 'Básquet',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          grad: 'from-amber-950 via-navy-950 to-navy-900',
          accent: 'border-l-4 border-amber-500',
        };
      case 'VOLEY':
        return {
          label: 'Vóley',
          badgeBg: 'bg-sky-100 text-sky-900 border-sky-200',
          grad: 'from-sky-950 via-navy-950 to-navy-900',
          accent: 'border-l-4 border-sky-500',
        };
      case 'PADEL':
        return {
          label: 'Pádel',
          badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          grad: 'from-indigo-950 via-navy-950 to-navy-900',
          accent: 'border-l-4 border-indigo-500',
        };
      default:
        return {
          label: dep || 'Deporte',
          badgeBg: 'bg-navy-100 text-navy-800 border-navy-200',
          grad: 'from-navy-950 via-navy-900 to-navy-800',
          accent: 'border-l-4 border-navy-500',
        };
    }
  };

  const visual = getDeporteVisual(cancha.deporte);

  const getFormatoLabel = () => {
    if (cancha.deporte === 'FUTBOL' && cancha.formato) {
      const map: Record<string, string> = {
        FUTBOL_5: 'Fútbol 5',
        FUTBOL_7: 'Fútbol 7',
        FUTBOL_11: 'Fútbol 11',
      };
      return map[cancha.formato] || cancha.formato;
    }
    if (cancha.deporte === 'BASQUET') {
      return cancha.medioCampo ? 'Medio campo' : 'Cancha completa';
    }
    if (cancha.deporte === 'VOLEY') {
      return cancha.esDePlaya ? 'Vóley playa' : 'Piso reglamentario';
    }
    if (cancha.deporte === 'PADEL') {
      return cancha.paredesDeVidrio ? 'Paredes de cristal' : 'Malla metálica';
    }
    return null;
  };

  const formatoEspecifico = getFormatoLabel();

  return (
    <Card variant="elevated" className={`flex flex-col justify-between overflow-hidden group ${visual.accent}`}>
      {/* Cabecera visual con banner deportivo */}
      <div className={`relative h-32 bg-gradient-to-r ${visual.grad} p-4 flex flex-col justify-between text-white overflow-hidden`}>
        {/* Trazado decorativo sutil */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 100% 0%, #a3e635 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center justify-between gap-2 z-10">
          <span className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-sm ${visual.badgeBg}`}>
            {visual.label}
          </span>
          <div className="flex items-center gap-1.5">
            {cancha.iluminacion && (
              <span className="p-1 rounded-md bg-white/20 text-limeAccent-300 backdrop-blur-xs" title="Iluminación nocturna habilitada">
                <Zap className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="p-1 rounded-md bg-white/20 text-white backdrop-blur-xs" title={cancha.techada ? 'Techada' : 'Al aire libre'}>
              <SunMedium className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-navy-200 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-turf-400 shrink-0" />
            <span className="truncate">{cancha.sedeNombre || 'Sede Deportiva'}</span>
          </p>
        </div>
      </div>

      {/* Contenido descriptivo */}
      <div className="p-5 space-y-4 flex-1">
        <div>
          <h3 className="font-display font-bold text-lg text-navy-950 group-hover:text-turf-700 transition-colors">
            {cancha.nombre}
          </h3>
          {formatoEspecifico && (
            <p className="text-xs font-semibold text-navy-600 mt-0.5">
              {formatoEspecifico}
            </p>
          )}
        </div>

        {/* Ficha técnica resumida */}
        <div className="grid grid-cols-2 gap-2 text-xs text-navy-600 bg-navy-50/70 p-3 rounded-xl border border-navy-100">
          <div>
            <span className="text-[10px] text-navy-400 uppercase font-semibold block">Superficie</span>
            <span className="font-medium text-navy-800 truncate block">
              {cancha.superficie || 'Sintético'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-navy-400 uppercase font-semibold block">Cubierta</span>
            <span className="font-medium text-navy-800 block">
              {cancha.techada ? 'Techada' : 'Al aire libre'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-navy-400 uppercase font-semibold block">Iluminación</span>
            <span className="font-medium text-navy-800 block">
              {cancha.iluminacion ? 'Habilitada' : 'No cuenta'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-navy-400 uppercase font-semibold block">Tarifa Base</span>
            <span className="font-bold text-turf-700 block">
              S/. {(cancha.precioHora || cancha.precioNormal || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Pie de acción */}
      <div className="p-4 bg-navy-50/60 border-t border-navy-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-medium text-navy-500 block">Precio por hora</span>
          <span className="font-display font-extrabold text-base text-navy-950">
            S/. {(cancha.precioHora || cancha.precioNormal || 0).toFixed(2)}
          </span>
        </div>
        <Link to={`/canchas/${cancha.id}`}>
          <Button variant="primary" size="sm" icon={<Calendar className="w-3.5 h-3.5" />}>
            Reservar Turno
          </Button>
        </Link>
      </div>
    </Card>
  );
};
