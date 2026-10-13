import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { useListarMisSedes, useListarTodas, useEliminar } from '@/api/endpoints';
import type { SedeResponse } from '@/api/model/sedeResponse';
import { formatearHora } from '@/features/canchas/utils/tarifa';
import { CrearEditarSedeModal } from './components/CrearEditarSedeModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Clock,
  Grid,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export const AdminSedesPage: React.FC = () => {
  const { rol } = useAuth();
  const queryClient = useQueryClient();

  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sedeAEditar, setSedeAEditar] = useState<SedeResponse | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [sedeAEliminar, setSedeAEliminar] = useState<SedeResponse | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  // ADMIN_SEDE lista las sedes asignadas a su cuenta; ADMIN global lista todas
  const queryMisSedes = useListarMisSedes({
    query: {
      enabled: rol === 'ADMIN_SEDE',
    },
  });

  const queryTodasSedes = useListarTodas({
    query: {
      enabled: rol === 'ADMIN',
    },
  });

  const {
    data: sedes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = rol === 'ADMIN' ? queryTodasSedes : queryMisSedes;

  const eliminarMutation = useEliminar({
    mutation: {
      onSuccess: () => {
        setSedeAEliminar(null);
        setErrorEliminar(null);
        mostrarExito('Sede eliminada exitosamente.');
        refrescarDatos();
      },
      onError: (err) => {
        setErrorEliminar(
          getApiErrorMessage(err, 'No se pudo eliminar la sede. Verifica que no tenga canchas asociadas.')
        );
      },
    },
  });

  const refrescarDatos = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/sedes/mis'] });
    queryClient.invalidateQueries({ queryKey: ['/api/sedes'] });
    refetch();
  };

  const mostrarExito = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => {
      setMensajeExito(null);
    }, 4000);
  };

  const sedesFiltradas = useMemo(() => {
    if (!busqueda) return sedes;
    const q = busqueda.toLowerCase();
    return sedes.filter(
      (s) =>
        s.nombre?.toLowerCase().includes(q) ||
        s.direccion?.toLowerCase().includes(q) ||
        s.distrito?.toLowerCase().includes(q)
    );
  }, [sedes, busqueda]);

  const handleAbrirCrear = () => {
    setSedeAEditar(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (sede: SedeResponse) => {
    setSedeAEditar(sede);
    setModalAbierto(true);
  };

  const handleConfirmarEliminar = () => {
    if (!sedeAEliminar?.id) return;
    setErrorEliminar(null);
    eliminarMutation.mutate({ id: sedeAEliminar.id });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Acción Principal */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            {rol === 'ADMIN' ? 'Administración Global' : 'Panel Administrador de Sede'}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {rol === 'ADMIN' ? 'Gestión de Todas las Sedes' : 'Mis Sedes Deportivas'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Crea, edita y supervisa las sedes deportivas, sus horarios y canchas asignadas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAbrirCrear}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Sede</span>
        </button>
      </div>

      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Barra de Filtro y Búsqueda */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar sede por nombre, dirección o distrito..."
          className="w-full px-2 py-1.5 text-sm border-0 focus:outline-none focus:ring-0 text-slate-700 placeholder-slate-400"
        />
        {busqueda && (
          <button
            type="button"
            onClick={() => setBusqueda('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Estados: Carga, Error, Vacío */}
      {isLoading && (
        <LoadingSpinner mensaje="Cargando tus sedes deportivas..." />
      )}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al cargar las sedes')}
          onReintentar={() => refetch()}
        />
      )}

      {!isLoading && !isError && sedes.length === 0 && (
        <EmptyState
          titulo="Aún no tienes sedes registradas"
          descripcion="Comienza creando tu primera sede deportiva para agregar canchas, configurar precios y recibir reservas."
          icono={<Building2 className="w-8 h-8 text-slate-400" />}
          accion={
            <button
              type="button"
              onClick={handleAbrirCrear}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Crear mi primera sede</span>
            </button>
          }
        />
      )}

      {!isLoading && !isError && sedes.length > 0 && sedesFiltradas.length === 0 && (
        <EmptyState
          titulo="No se encontraron sedes coincidentes"
          descripcion={`No hay resultados para la búsqueda "${busqueda}".`}
          icono={<Building2 className="w-8 h-8 text-slate-400" />}
        />
      )}

      {/* Grid de Sedes */}
      {!isLoading && !isError && sedesFiltradas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sedesFiltradas.map((sede) => (
            <div
              key={sede.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-slate-800">
                      {sede.nombre}
                    </h2>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        sede.activa
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {sede.activa ? 'Operativa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span>
                        {sede.direccion}
                        {sede.distrito ? `, ${sede.distrito}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Horario: {formatearHora(sede.horaApertura)} -{' '}
                        {formatearHora(sede.horaCierre)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  {/* Botón Gestión de Canchas */}
                  <Link
                    to={`/admin/canchas?sedeId=${sede.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition"
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Gestionar Canchas de esta Sede</span>
                  </Link>

                  {/* Botones de Edición y Eliminación */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAbrirEditar(sede)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorEliminar(null);
                        setSedeAEliminar(sede);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Crear / Editar Sede */}
      {modalAbierto && (
        <CrearEditarSedeModal
          sedeAEditar={sedeAEditar}
          onClose={() => setModalAbierto(false)}
          onSuccess={(sedeGuardada) => {
            setModalAbierto(false);
            mostrarExito(
              sedeAEditar
                ? `Sede "${sedeGuardada.nombre}" actualizada con éxito.`
                : `Sede "${sedeGuardada.nombre}" creada con éxito.`
            );
            refrescarDatos();
          }}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {sedeAEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-800">
                ¿Eliminar Sede Deportiva?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                ¿Estás seguro de que deseas eliminar la sede{' '}
                <strong className="text-slate-900">"{sedeAEliminar.nombre}"</strong>?
                Esta acción no se puede deshacer.
              </p>
            </div>

            {errorEliminar && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs"
              >
                {errorEliminar}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSedeAEliminar(null)}
                disabled={eliminarMutation.isPending}
                className="w-full px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={eliminarMutation.isPending}
                className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {eliminarMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Sí, Eliminar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

