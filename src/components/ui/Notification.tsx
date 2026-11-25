import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface NotificationProps {
  type?: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
}) => {
  const configs = {
    success: {
      bg: 'bg-turf-50',
      border: 'border-turf-200',
      text: 'text-turf-900',
      iconColor: 'text-turf-600',
      Icon: CheckCircle2,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      iconColor: 'text-amber-600',
      Icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-900',
      iconColor: 'text-rose-600',
      Icon: AlertCircle,
    },
    info: {
      bg: 'bg-navy-50',
      border: 'border-navy-200',
      text: 'text-navy-900',
      iconColor: 'text-navy-600',
      Icon: Info,
    },
  }[type];

  const { bg, border, text, iconColor, Icon } = configs;

  return (
    <div
      role="alert"
      className={`p-4 rounded-2xl border ${bg} ${border} ${text} shadow-sm flex items-start justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
        <div className="space-y-0.5">
          {title && <h4 className="text-sm font-bold tracking-tight">{title}</h4>}
          <p className="text-xs sm:text-sm leading-relaxed font-normal">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-navy-400 hover:text-navy-700 p-1 rounded-lg transition-colors focus:outline-none"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
