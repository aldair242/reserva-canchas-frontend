import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  titulo?: string;
  descripcion: string;
  icono?: React.ReactNode;
  accion?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  titulo = 'No hay datos disponibles',
  descripcion,
  icono,
  accion,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-white ${className}`}>
      <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-3">
        {icono || <Inbox className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{titulo}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{descripcion}</p>
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
};
