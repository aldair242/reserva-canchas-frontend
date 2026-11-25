import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      className={`flex items-center justify-between sm:justify-end gap-2 py-3 ${className}`}
      aria-label="Paginación"
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-navy-200 bg-white text-xs font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Anterior</span>
      </button>

      <span className="text-xs text-navy-600 font-medium px-2">
        Página <strong className="text-navy-950 font-bold">{currentPage}</strong> de{' '}
        <strong className="text-navy-950 font-bold">{totalPages}</strong>
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-navy-200 bg-white text-xs font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <span>Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
