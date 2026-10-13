import React, { useState, useMemo } from 'react';
import {
  useListarAdministradoresSede,
  type AdministradorSedeResponse,
} from './adminUsuariosApi';
import { CrearAdminSedeModal } from './components/CrearAdminSedeModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  UserCheck,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AdminUsuariosPage: React.FC = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const {
    data: administradores = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useListarAdministradoresSede();

  const mostrarExito = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => {
      setMensajeExito(null);
    }, 4000);
  };

  const administradoresFiltrados = useMemo(() => {
    if (!busqueda) return administradores;
    const q = busqueda.toLowerCase();
    return administradores.filter(
      (a) =>
        a.nombre?.toLowerCase().includes(q) ||
        a.apellido?.toLowerCase().includes(q) ||
        a.correo?.toLowerCase().includes(q) ||
        a.telefono?.toLowerCase().includes(q)
    );
  }, [administradores, busqueda]);

  const handleExitoCreacion = (nuevoAdmin: AdministradorSedeResponse) => {
    setModalAbierto(false);
    mostrarExito(`Administrador de sede ${nuevoAdmin.nombre} ${nuevoAdmin.apellido} creado exitosamente.`);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Acción Principal */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Panel de Administración Global</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Administradores de Sede
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registra y gestiona las cuentas autorizadas para administrar complejos deportivos y canchas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Administrador</span>
        </button>
      </div>

      {/* Alerta de éxito */}
      {mensajeExito && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Barra de Búsqueda */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total de administradores:{' '}
          <strong className="text-slate-800">{administradoresFiltrados.length}</strong>
        </div>
      </div>

      {/* Estado de Carga y Error */}
      {isLoading && (
        <LoadingSpinner mensaje="Cargando lista de administradores..." className="py-12" />
      )}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'No se pudo cargar la lista de administradores de sede')}
          onReintentar={() => refetch()}
        />
      )}

      {/* Listado */}
      {!isLoading && !isError && administradoresFiltrados.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No se encontraron administradores de sede
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {busqueda
                ? 'Ningún usuario coincide con tu término de búsqueda.'
                : 'Aún no se ha registrado ningún usuario con el rol de Administrador de Sede.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear Primer Administrador</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && administradoresFiltrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {administradoresFiltrados.map((admin) => (
            <div
              key={admin.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      {admin.nombre.charAt(0)}
                      {admin.apellido.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">
                        {admin.nombre} {admin.apellido}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        ADMIN_SEDE
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      admin.activo ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    title={admin.activo ? 'Usuario Activo' : 'Usuario Inactivo'}
                  />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{admin.correo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{admin.telefono}</span>
                  </div>
                </div>
              </div>

              {/* Sedes Asignadas */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  Sedes a su cargo ({admin.sedeNombres?.length || 0}):
                </span>
                {admin.sedeNombres && admin.sedeNombres.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {admin.sedeNombres.map((sedeNom, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md"
                      >
                        {sedeNom}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Sin sedes asignadas actualmente.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear Administrador de Sede */}
      {modalAbierto && (
        <CrearAdminSedeModal
          onClose={() => setModalAbierto(false)}
          onSuccess={handleExitoCreacion}
        />
      )}
    </div>
  );
};

