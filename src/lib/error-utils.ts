import { isAxiosError } from 'axios';

export interface BackendApiError {
  codigo?: string;
  mensaje?: string;
  detalles?: string[];
  timestamp?: string;
}

export const getApiErrorMessage = (error: unknown, fallbackMessage = 'Ha ocurrido un error inesperado.'): string => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as BackendApiError | undefined;

    if (data?.mensaje) {
      if (status === 409) {
        return data.mensaje.includes('ya no está disponible')
          ? data.mensaje
          : `${data.mensaje} (El horario o recurso ya no se encuentra disponible).`;
      }
      return data.mensaje;
    }

    if (status === 400) {
      return 'Los datos ingresados son inválidos. Revisa los campos del formulario.';
    }
    if (status === 401) {
      return 'Credenciales inválidas o sesión expirada.';
    }
    if (status === 403) {
      return 'No tienes permisos suficientes para realizar esta acción.';
    }
    if (status === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }
    if (status === 409) {
      return 'Conflicto: El horario o recurso seleccionado ya no está disponible.';
    }
    if (status && status >= 500) {
      return 'Error interno del servidor. Por favor, intenta nuevamente más tarde.';
    }
    if (error.message === 'Network Error') {
      return 'No se pudo conectar con el servidor. Verifica que el backend esté disponible.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};
