import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  mensaje: string;
  onReintentar?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  mensaje,
  onReintentar,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 ${className}`}
    >
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-red-800">Ocurrió un error</h3>
          <div className="mt-1 text-sm text-red-700">{mensaje}</div>
          {onReintentar && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onReintentar}
                className="inline-flex items-center text-xs font-semibold text-red-800 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded transition"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
