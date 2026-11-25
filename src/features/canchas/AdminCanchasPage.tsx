import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import {
  useListarMisSedes,
  useListarTodas,
  useListarTodas1,
  useEliminar1,
} from '@/api/endpoints';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import { formatearPrecio } from './utils/tarifa';
import { CrearEditarCanchaModal } from './components/CrearEditarCanchaModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { EmptyState } from '@/components/common/EmptyState';
import { getApiErrorMessage } from '@/lib/error-utils';
import {
  Grid,
  Plus,
  Pencil,
  Trash2,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
} from 'lucide-react';

export const AdminCanchasPage: React.FC = () => {
  const { rol } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const sedeIdParam = searchParams.get('sedeId');
  const [sedeSeleccionadaId, setSedeSeleccionadaId] = useState<number | null>(
    sedeIdParam ? parseInt(sedeIdParam, 10) : null
  );

  const [modalAbierto, setModalAbierto] = useState(false);
  const [canchaAEditar, setCanchaAEditar] = useState<CanchaResponse | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [canchaAEliminar, setCanchaAEliminar] = useState<CanchaResponse | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  // Obtener sedes disponibles para el administrador
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
    isLoading: cargandoSedes,
  } = rol === 'ADMIN' ? queryTodasSedes : queryMisSedes;

  // Si no hay sede seleccionada pero hay sedes disponibles, seleccionar la primera
  useEffect(() => {
    if (sedes.length > 0 && !sedeSeleccionadaId) {
      const inicialId = sedeIdParam ? parseInt(sedeIdParam, 10) : sedes[0].id!;
      setSedeSeleccionadaId(inicialId);
    }
  }, [sedes, sedeSeleccionadaId, sedeIdParam]);

  // Consultar canchas de la sede seleccionada
  const {
    data: canchas = [],
    isLoading: cargandoCanchas,
    isError,
    error,
    refetch,
  } = useListarTodas1(
    sedeSeleccionadaId ? { sedeId: sedeSeleccionadaId } : undefined,
    {
      query: {
        enabled: !!sedeSeleccionadaId,
      },
    }
  );

  const eliminarMutation = useEliminar1({
    mutation: {
      onSuccess: () => {
        setCanchaAEliminar(null);
        setErrorEliminar(null);
        mostrarExito('Cancha eliminada exitosamente.');
        refrescarDatos();
      },
      onError: (err) => {
        setErrorEliminar(
          getApiErrorMessage(
            err,
            'No se pudo eliminar la cancha. Verifica que no tenga reservas asociadas.'
          )
        );
      },
    },
  });

  const refrescarDatos = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/canchas'] });
    refetch();
  };

  const mostrarExito = (msg: string) => {
    setMensajeExito(msg);
    setTimeout(() => {
      setMensajeExito(null);
    }, 4000);
  };

  const handleCambioSede = (nuevoId: number) => {
    setSedeSeleccionadaId(nuevoId);
    setSearchParams({ sedeId: String(nuevoId) });
  };

  const handleAbrirCrear = () => {
    setCanchaAEditar(null);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (cancha: CanchaResponse) => {
    setCanchaAEditar(cancha);
    setModalAbierto(true);
  };

  const handleConfirmarEliminar = () => {
    if (!canchaAEliminar?.id) return;
    setErrorEliminar(null);
    eliminarMutation.mutate({ id: canchaAEliminar.id });
  };

  const sedeActual = useMemo(
    () => sedes.find((s) => s.id === sedeSeleccionadaId),
    [sedes, sedeSeleccionadaId]
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2">
            <Grid className="w-3.5 h-3.5 text-emerald-600" />
            <span>Gestión de Instalaciones y Tarifas</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Canchas Deportivas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Administra las canchas, superficies, disciplinas deportivas y precios de cada sede.
          </p>
        </div>

        {sedes.length > 0 && (
          <button
            type="button"
            onClick={handleAbrirCrear}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cancha</span>
          </button>
        )}
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

      {/* Selector de Sede */}
      {cargandoSedes ? (
        <LoadingSpinner mensaje="Cargando sedes disponibles..." />
      ) : sedes.length === 0 ? (
        <EmptyState
          titulo="Primero debes crear una sede"
          descripcion="Para poder registrar canchas y configurar tarifas, necesitas tener al menos una sede registrada."
          icono={<Building2 className="w-8 h-8 text-slate-400" />}
          accion={
            <Link
              to="/admin/sedes"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Ir a Mis Sedes</span>
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <label className="text-xs font-semibold text-slate-700 shrink-0">
              Sede activa:
            </label>
            <select
              value={sedeSeleccionadaId || ''}
              onChange={(e) => handleCambioSede(Number(e.target.value))}
              className="w-full sm:w-72 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
            >
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.distrito})
                </option>
              ))}
            </select>
          </div>

          {sedeActual && (
            <div className="text-xs text-slate-500">
              {canchas.length} {canchas.length === 1 ? 'cancha registrada' : 'canchas registradas'} en esta sede
            </div>
          )}
        </div>
      )}

      {/* Contenido de Canchas */}
      {cargandoCanchas && (
        <LoadingSpinner mensaje="Cargando canchas de la sede..." />
      )}

      {isError && (
        <ErrorMessage
          mensaje={getApiErrorMessage(error, 'Error al cargar las canchas')}
          onReintentar={() => refetch()}
        />
      )}

      {!cargandoCanchas && !isError && sedes.length > 0 && canchas.length === 0 && (
        <EmptyState
          titulo="No hay canchas registradas en esta sede"
          descripcion="Agrega tu primera cancha con su deporte y estrategia de precios para empezar a recibir turnos."
          icono={<Grid className="w-8 h-8 text-slate-400" />}
          accion={
            <button
              type="button"
              onClick={handleAbrirCrear}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Cancha</span>
            </button>
          }
        />
      )}

      {!cargandoCanchas && !isError && canchas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canchas.map((cancha) => (
            <div
              key={cancha.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {cancha.deporte}
                      </span>
                      <h2 className="text-lg font-bold text-slate-800 mt-2">
                        {cancha.nombre}
                      </h2>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        cancha.activa
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {cancha.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Superficie:</span>
                      <span className="font-medium text-slate-800">
                        {cancha.superficie?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Instalación:</span>
                      <span className="font-medium text-slate-800">
                        {cancha.techada ? 'Techada' : 'Al aire libre'}
                        {cancha.iluminacion ? ' · Iluminada' : ''}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        Precio Base:
                      </span>
                      <span className="text-sm font-bold text-emerald-800">
                        {formatearPrecio(cancha.precioHora || cancha.precioNormal || 0)} / hora
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                  <Link
                    to={`/canchas/${cancha.id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ver Vista Pública / Disponibilidad</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAbrirEditar(cancha)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorEliminar(null);
                        setCanchaAEliminar(cancha);
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

      {/* Modal Crear / Editar Cancha */}
      {modalAbierto && (
        <CrearEditarCanchaModal
          canchaAEditar={canchaAEditar}
          sedesDisponibles={sedes}
          sedeSeleccionadaId={sedeSeleccionadaId || undefined}
          onClose={() => setModalAbierto(false)}
          onSuccess={(guardada) => {
            setModalAbierto(false);
            mostrarExito(
              canchaAEditar
                ? `Cancha "${guardada.nombre}" actualizada con éxito.`
                : `Cancha "${guardada.nombre}" registrada con éxito.`
            );
            refrescarDatos();
          }}
        />
      )}

      {/* Modal Confirmación de Eliminación */}
      {canchaAEliminar && (
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
                ¿Eliminar Cancha Deportiva?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                ¿Estás seguro de que deseas eliminar la cancha{' '}
                <strong className="text-slate-900">"{canchaAEliminar.nombre}"</strong>?
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
                onClick={() => setCanchaAEliminar(null)}
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
