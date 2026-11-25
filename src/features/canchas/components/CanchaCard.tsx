import React from 'react';
import { Link } from 'react-router-dom';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import { formatearHora, formatearPrecio } from '../utils/tarifa';
import {
  Sun,
  Shield,
  Layers,
  Calendar,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface CanchaCardProps {
  cancha: CanchaResponse;
}

export const CanchaCard: React.FC<CanchaCardProps> = ({ cancha }) => {
  // Configuración visual por disciplina deportiva
  const getDeporteInfo = (dep?: string) => {
    switch (dep) {
      case 'FUTBOL':
        return {
          label: 'Fútbol',
          emoji: '⚽',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'BASQUET':
        return {
          label: 'Básquet',
          emoji: '🏀',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
        };
      case 'VOLEY':
        return {
          label: 'Vóley',
          emoji: '🏐',
          color: 'bg-sky-100 text-sky-800 border-sky-200',
        };
      case 'PADEL':
        return {
          label: 'Pádel',
          emoji: '🎾',
          color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        };
      default:
        return {
          label: dep || 'Deporte',
          emoji: '🏆',
          color: 'bg-slate-100 text-slate-800 border-slate-200',
        };
    }
  };

  const deporteInfo = getDeporteInfo(cancha.deporte);

  // Características específicas según disciplina deportiva
  const renderDetallesDeporte = () => {
    if (cancha.deporte === 'FUTBOL' && cancha.formato) {
      const formatoLabels: Record<string, string> = {
        FUTBOL_5: 'Fútbol 5',
        FUTBOL_7: 'Fútbol 7',
        FUTBOL_11: 'Fútbol 11',
      };
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          Formato: {formatoLabels[cancha.formato] || cancha.formato}
        </span>
      );
    }

    if (cancha.deporte === 'BASQUET') {
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
          {cancha.medioCampo ? 'Medio campo' : 'Cancha completa'}
        </span>
      );
    }

    if (cancha.deporte === 'VOLEY') {
      return (
        <div className="flex flex-wrap gap-1">
          {cancha.esDePlaya ? (
            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Vóley playa
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Vóley pista
            </span>
          )}
          {cancha.alturaRed && (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
              Red: {cancha.alturaRed}m
            </span>
          )}
        </div>
      );
    }

    if (cancha.deporte === 'PADEL') {
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
          {cancha.paredesDeVidrio ? 'Cristal panorámico' : 'Paredes estándar'}
        </span>
      );
    }

    return null;
  };

  // Formato de superficie legible
  const formatSuperficie = (sup?: string) => {
    switch (sup) {
      case 'CESPED_SINTETICO':
        return 'Césped sintético';
      case 'CESPED_NATURAL':
        return 'Césped natural';
      case 'PARQUET':
        return 'Parquet';
      case 'LOSA':
        return 'Losa de concreto';
      case 'ARCILLA':
        return 'Arcilla';
      default:
        return sup || 'Estándar';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      {/* Cabecera de la tarjeta */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${deporteInfo.color}`}
              >
                <span>{deporteInfo.emoji}</span>
                <span>{deporteInfo.label}</span>
              </span>
              {renderDetallesDeporte()}
            </div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight">
              {cancha.nombre}
            </h3>
            {cancha.sedeNombre && (
              <p className="text-xs text-slate-500 mt-0.5">
                Sede: <span className="font-medium text-slate-700">{cancha.sedeNombre}</span>
              </p>
            )}
          </div>
        </div>

        {/* Atributos: Superficie, Techada, Iluminación */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{formatSuperficie(cancha.superficie)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              {cancha.techada ? (
                <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Techada
                </span>
              ) : (
                <span className="text-slate-500 inline-flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-slate-400" /> Al aire libre
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2">
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {cancha.iluminacion ? (
                <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Con iluminación nocturna
                </span>
              ) : (
                <span className="text-slate-500 inline-flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-slate-400" /> Sin iluminación
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Sección de Tarifas */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex-1 flex flex-col justify-end">
          {cancha.tipoTarifa === 'ESTANDAR' && (
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Tarifa Estándar
              </span>
              <div className="text-lg font-extrabold text-slate-800">
                {formatearPrecio(cancha.precioHora)}{' '}
                <span className="text-xs font-normal text-slate-500">/ hora</span>
              </div>
            </div>
          )}

          {cancha.tipoTarifa === 'HORA_PICO' && (
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Tarifa Diferenciada
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-slate-800">
                  {formatearPrecio(cancha.precioNormal)}
                  <span className="text-xs font-normal text-slate-500"> /h</span>
                </span>
                <span className="text-xs font-semibold text-rose-600">
                  Pico: {formatearPrecio(cancha.precioPico)}
                  <span className="text-[10px] text-slate-400 font-normal">
                    {' '}({formatearHora(cancha.inicioPico)} a {formatearHora(cancha.finPico)})
                  </span>
                </span>
              </div>
            </div>
          )}

          {cancha.tipoTarifa === 'PROMOCIONAL' && (
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {cancha.porcentajeDescuento}% de descuento
              </div>
              <div className="text-lg font-extrabold text-slate-800">
                {formatearPrecio(
                  (cancha.precioHora || 0) * (1 - (cancha.porcentajeDescuento || 0) / 100)
                )}{' '}
                <span className="text-xs font-normal text-slate-400 line-through">
                  {formatearPrecio(cancha.precioHora)}
                </span>
                <span className="text-xs font-normal text-slate-500"> / hora</span>
              </div>
            </div>
          )}
        </div>

        {/* Botón de Acción */}
        <div className="mt-4 pt-3">
          <Link
            to={`/canchas/${cancha.id}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver disponibilidad y reservar</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
