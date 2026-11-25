import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  mensaje?: string;
  tamano?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  mensaje = 'Cargando...',
  tamano = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[tamano];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-emerald-600 ${className}`}
    >
      <Loader2 className={`${sizeClasses} animate-spin`} />
      {mensaje && <span className="mt-2 text-sm font-medium text-slate-600">{mensaje}</span>}
      <span className="sr-only">Cargando</span>
    </div>
  );
};
