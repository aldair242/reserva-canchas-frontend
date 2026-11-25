import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  Activity,
  Radio,
} from 'lucide-react';

export type StatusType =
  | 'CONFIRMADA'
  | 'PENDIENTE'
  | 'PENDIENTE_ATRIBUCION'
  | 'CANCELADA'
  | 'COMPLETADA'
  | 'NO_SHOW'
  | 'PROGRAMADO'
  | 'EN_JUEGO'
  | 'FINALIZADO'
  | 'PROCESANDO'
  | 'LISTO'
  | 'ERROR'
  | 'DESCARTADO'
  | 'ONLINE'
  | 'OFFLINE'
  | 'DISPONIBLE'
  | 'SIMULADO'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  showIcon = true,
  className = '',
  size = 'md',
}) => {
  const norm = (status || '').toUpperCase().trim();

  let label = customLabel || status;
  let bg = 'bg-navy-100';
  let text = 'text-navy-700';
  let border = 'border-navy-200';
  let IconComponent: React.ComponentType<{ className?: string }> | null = null;
  let pulse = false;

  switch (norm) {
    // Éxito / Confirmado / Listo (Verde)
    case 'CONFIRMADA':
    case 'CONFIRMADO':
    case 'LISTO':
    case 'COMPLETADA':
    case 'DISPONIBLE':
    case 'ONLINE':
      label = customLabel || (norm === 'CONFIRMADA' ? 'Confirmada' : norm === 'LISTO' ? 'Listo' : norm === 'DISPONIBLE' ? 'Disponible' : norm === 'ONLINE' ? 'En línea' : 'Completada');
      bg = 'bg-turf-50';
      text = 'text-turf-800';
      border = 'border-turf-200';
      IconComponent = CheckCircle2;
      break;

    // Advertencia / Pendiente / En proceso (Ámbar)
    case 'PENDIENTE':
    case 'PENDIENTE_ATRIBUCION':
    case 'PROCESANDO':
    case 'PROGRAMADO':
      label = customLabel || (norm === 'PENDIENTE_ATRIBUCION' ? 'Pendiente Atribución' : norm === 'PENDIENTE' ? 'Pendiente' : norm === 'PROCESANDO' ? 'Procesando' : 'Programado');
      bg = 'bg-amber-50';
      text = 'text-amber-800';
      border = 'border-amber-200';
      IconComponent = Clock;
      break;

    // Peligro / Cancelado / Error (Rojo)
    case 'CANCELADA':
    case 'CANCELADO':
    case 'ERROR':
    case 'NO_SHOW':
    case 'OFFLINE':
      label = customLabel || (norm === 'CANCELADA' ? 'Cancelada' : norm === 'ERROR' ? 'Error' : norm === 'OFFLINE' ? 'Desconectado' : 'No asistió');
      bg = 'bg-rose-50';
      text = 'text-rose-800';
      border = 'border-rose-200';
      IconComponent = XCircle;
      break;

    // En juego en vivo (Rojo pulsante con icono de actividad)
    case 'EN_JUEGO':
      label = customLabel || 'En Juego (En vivo)';
      bg = 'bg-rose-100';
      text = 'text-rose-900';
      border = 'border-rose-300';
      IconComponent = Radio;
      pulse = true;
      break;

    // Finalizado / Descartado (Gris neutro)
    case 'FINALIZADO':
    case 'DESCARTADO':
      label = customLabel || (norm === 'FINALIZADO' ? 'Finalizado' : 'Descartado');
      bg = 'bg-navy-100';
      text = 'text-navy-700';
      border = 'border-navy-200';
      IconComponent = Check;
      break;

    // Etiqueta SIMULADO (Acento lima deportivo con texto navy)
    case 'SIMULADO':
      label = customLabel || 'SIMULADO';
      bg = 'bg-limeAccent-400';
      text = 'text-navy-950 font-bold';
      border = 'border-limeAccent-500';
      IconComponent = Activity;
      break;

    default:
      label = customLabel || status;
      bg = 'bg-navy-50';
      text = 'text-navy-700';
      border = 'border-navy-200';
      IconComponent = null;
      break;
  }

  const sizeClasses =
    size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${bg} ${text} ${border} ${sizeClasses} select-none ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
    >
      {showIcon && IconComponent && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};
