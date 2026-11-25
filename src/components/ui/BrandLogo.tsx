import React from 'react';

interface BrandLogoProps {
  className?: string;
  isDark?: boolean;
  withSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  isDark = false,
  withSubtitle = true,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icono vectorial deportivo: escudo geométrico estilizado con trazo de cancha */}
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-turf-600 to-turf-800 p-1.5 shadow-sm flex items-center justify-center shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
          aria-hidden="true"
        >
          {/* Límites de campo deportivo */}
          <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="2" />
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
        </svg>
        {/* Punto de acento lima */}
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-limeAccent-400 rounded-full ring-2 ring-white" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-0.5">
          <span
            className={`font-display font-extrabold text-xl tracking-tight leading-none ${
              isDark ? 'text-white' : 'text-navy-950'
            }`}
          >
            Cancha<span className="text-turf-600">Ya</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-limeAccent-500 ml-0.5" />
        </div>
        {withSubtitle && (
          <span
            className={`text-[10px] font-medium tracking-wide uppercase leading-tight mt-0.5 ${
              isDark ? 'text-navy-300' : 'text-navy-500'
            }`}
          >
            Gestión Deportiva
          </span>
        )}
      </div>
    </div>
  );
};
