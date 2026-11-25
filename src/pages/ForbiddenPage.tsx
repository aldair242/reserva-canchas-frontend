import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">403</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Acceso restringido</h2>
      <p className="mt-2 text-sm text-slate-600 max-w-md">
        No tienes los permisos necesarios para acceder a este recurso con tu rol actual.
      </p>
      <div className="mt-6 flex space-x-3">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          <Home className="w-4 h-4 mr-2" />
          Ir al inicio
        </Link>
      </div>
    </div>
  );
};
