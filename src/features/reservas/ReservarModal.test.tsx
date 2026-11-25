import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReservarModal } from './components/ReservarModal';
import { AuthContext } from '@/features/auth/AuthContext';
import type { CanchaResponse } from '@/api/model/canchaResponse';
import type { UsuarioAutenticado } from '@/types/auth';
import * as endpoints from '@/api/endpoints';
import { AxiosError, AxiosHeaders } from 'axios';

const mockCancha: CanchaResponse = {
  id: 1,
  nombre: 'Cancha 1 - Fútbol 5',
  deporte: 'FUTBOL',
  sedeNombre: 'Sede Central',
  tipoTarifa: 'ESTANDAR',
  precioHora: 80,
};

const mockJugador: UsuarioAutenticado = {
  id: 10,
  nombre: 'Carlos',
  apellido: 'Gomez',
  correo: 'carlos@prueba.com',
  rol: 'JUGADOR',
};

const renderReservarModal = ({
  usuario = mockJugador,
  onRefresh = vi.fn(),
  onClose = vi.fn(),
  onSuccess = vi.fn(),
}: {
  usuario?: UsuarioAutenticado | null;
  onRefresh?: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
} = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            usuario,
            token: usuario ? 'fake-token' : null,
            rol: usuario?.rol || null,
            estaAutenticado: !!usuario,
            login: vi.fn(),
            logout: vi.fn(),
          }}
        >
          <ReservarModal
            cancha={mockCancha}
            fecha="2026-10-15"
            horaInicio="10:00:00"
            horaFin="11:00:00"
            precioEstimado={80}
            onClose={onClose}
            onSuccess={onSuccess}
            onRefreshDisponibilidad={onRefresh}
          />
        </AuthContext.Provider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ReservarModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra aviso para iniciar sesión cuando no hay usuario autenticado', () => {
    renderReservarModal({ usuario: null });

    expect(screen.getByText(/inicia sesión para reservar/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra el resumen de la cancha, fecha, hora y precio para un JUGADOR', () => {
    renderReservarModal();

    expect(screen.getByText('Cancha 1 - Fútbol 5')).toBeInTheDocument();
    expect(screen.getByText('2026-10-15')).toBeInTheDocument();
    expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
    expect(screen.getByText('S/ 80.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmar reserva/i })).toBeInTheDocument();
  });

  it('maneja conflicto HTTP 409 mostrando mensaje de horario no disponible y refresca turnos', async () => {
    const user = userEvent.setup();
    const onRefreshMock = vi.fn();

    const axiosError409 = new AxiosError(
      'Request failed with status code 409',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 409,
        statusText: 'Conflict',
        data: {
          status: 409,
          message: 'La cancha ya está reservada en ese horario o se está reservando en este momento, intenta de nuevo',
        },
        headers: {},
        config: { headers: new AxiosHeaders() },
      }
    );

    vi.spyOn(endpoints, 'useCrear1').mockImplementation((options) => {
      return {
        mutate: vi.fn().mockImplementation(() => {
          // @ts-expect-error test mock
          options?.mutation?.onError?.(axiosError409, {}, undefined);
        }),
        isPending: false,
      } as unknown as ReturnType<typeof endpoints.useCrear1>;
    });

    renderReservarModal({ onRefresh: onRefreshMock });

    const btnConfirmar = screen.getByRole('button', { name: /confirmar reserva/i });
    await user.click(btnConfirmar);

    await waitFor(() => {
      expect(
        screen.getByText(/el horario seleccionado ya no está disponible/i)
      ).toBeInTheDocument();
      expect(onRefreshMock).toHaveBeenCalledTimes(1);
    });
  });

  it('completa la reserva con éxito y muestra el código de confirmación', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    vi.spyOn(endpoints, 'useCrear1').mockImplementation((options) => {
      return {
        mutate: vi.fn().mockImplementation(() => {
          // @ts-expect-error test mock
          options?.mutation?.onSuccess?.(
            {
              id: 42,
              codigo: 'RES-CONFIRM-99',
              fecha: '2026-10-15',
              horaInicio: '10:00:00',
              horaFin: '11:00:00',
              precioTotal: 80,
              estado: 'PENDIENTE',
            },
            {},
            undefined
          );
        }),
        isPending: false,
      } as unknown as ReturnType<typeof endpoints.useCrear1>;
    });

    renderReservarModal({ onSuccess: onSuccessMock });

    const btnConfirmar = screen.getByRole('button', { name: /confirmar reserva/i });
    await user.click(btnConfirmar);

    await waitFor(() => {
      expect(screen.getByText(/¡reserva creada con éxito!/i)).toBeInTheDocument();
      expect(screen.getByText('RES-CONFIRM-99')).toBeInTheDocument();
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });
});
