import { useQuery, useMutation } from '@tanstack/react-query';
import { customInstance } from '@/lib/api-client';

export interface AdministradorSedeResponse {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  activo: boolean;
  sedeIds?: number[];
  sedeNombres?: string[];
}

export interface CrearAdminSedeRequest {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
}

export const useListarAdministradoresSede = () => {
  return useQuery<AdministradorSedeResponse[]>({
    queryKey: ['/api/admin/usuarios/administradores-sede'],
    queryFn: ({ signal }) =>
      customInstance<AdministradorSedeResponse[]>({
        url: '/api/admin/usuarios/administradores-sede',
        method: 'GET',
        signal,
      }),
  });
};

export const useCrearAdministradorSede = (options?: {
  onSuccess?: (data: AdministradorSedeResponse) => void;
  onError?: (err: unknown) => void;
}) => {
  return useMutation<AdministradorSedeResponse, unknown, CrearAdminSedeRequest>({
    mutationFn: (data) =>
      customInstance<AdministradorSedeResponse>({
        url: '/api/admin/usuarios/administradores-sede',
        method: 'POST',
        data,
      }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export interface ActualizarAdminSedeRequest {
  nombre: string;
  apellido: string;
  correo: string;
  password?: string;
  telefono: string;
  activo?: boolean;
}

export const useActualizarAdministradorSede = (options?: {
  onSuccess?: (data: AdministradorSedeResponse) => void;
  onError?: (err: unknown) => void;
}) => {
  return useMutation<AdministradorSedeResponse, unknown, { id: number; data: ActualizarAdminSedeRequest }>({
    mutationFn: ({ id, data }) =>
      customInstance<AdministradorSedeResponse>({
        url: `/api/admin/usuarios/administradores-sede/${id}`,
        method: 'PUT',
        data,
      }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

export const useEliminarAdministradorSede = (options?: {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) => {
  return useMutation<void, unknown, number>({
    mutationFn: (id) =>
      customInstance<void>({
        url: `/api/admin/usuarios/administradores-sede/${id}`,
        method: 'DELETE',
      }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};

