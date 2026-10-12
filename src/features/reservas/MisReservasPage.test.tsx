import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MisReservasPage } from './MisReservasPage';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import * as endpoints from '@/api/endpoints';

const mockReservas: ReservaResponse[] = [
  {
    id: 101,
    codigo: 'RES-AAA-101',
    fecha: '2026-10-20',
    horaInicio: '09:00:00',
    horaFin: '10:00:00',
    precioTotal: 80.0,
    canchaNombre: 'Cancha 1 - Fútbol 5',
    estado: 'PENDIENTE',
    pagada: false,
    partidoId: undefined,
  },
  {
    id: 102,
    codigo: 'RES-BBB-102',
    fecha: '2026-10-22',
    horaInicio: '19:00:00',
    horaFin: '20:00:00',
    precioTotal: 60.0,
    canchaNombre: 'Cancha Pádel Cristal',
    estado: 'CONFIRMADA',
    pagada: true,
    partidoId: 50,
  },
];

const renderMisReservasPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <MisReservasPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('MisReservasPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza la lista de reservas del jugador con sus respectivos estados', () => {
    vi.spyOn(endpoints, 'useListarMisReservas').mockReturnValue({
      data: mockReservas,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof endpoints.useListarMisReservas>);

    renderMisReservasPage();

    expect(screen.getByText('Mis Reservas de Canchas')).toBeInTheDocument();
    expect(screen.getByText('Cancha 1 - Fútbol 5')).toBeInTheDocument();
    expect(screen.getByText('Cancha Pádel Cristal')).toBeInTheDocument();
    expect(screen.getByText('RES-AAA-101')).toBeInTheDocument();
    expect(screen.getByText('RES-BBB-102')).toBeInTheDocument();

    // Badges de estado y pago
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Pendiente de pago')).toBeInTheDocument();
    expect(screen.getByText('Confirmada')).toBeInTheDocument();
  });

  it('muestra el botón "Pagar ahora" para reservas pendientes y "Ver Partido" si tiene partidoId', () => {
    vi.spyOn(endpoints, 'useListarMisReservas').mockReturnValue({
      data: mockReservas,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof endpoints.useListarMisReservas>);

    renderMisReservasPage();

    expect(screen.getByRole('button', { name: /pagar ahora/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver partido/i })).toHaveAttribute(
      'href',
      '/partidos/50'
    );
  });

  it('abre el modal de cancelación mostrando la advertencia de la regla de las 2 horas', async () => {
    const user = userEvent.setup();

    vi.spyOn(endpoints, 'useListarMisReservas').mockReturnValue({
      data: mockReservas,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof endpoints.useListarMisReservas>);

    renderMisReservasPage();

    const botonesCancelar = screen.getAllByRole('button', { name: /cancelar/i });
    await user.click(botonesCancelar[0]);

    await waitFor(() => {
      expect(
        screen.getByText(/regla de cancelación \(2 horas de anticipación\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/las reservas solo pueden cancelarse con al menos/i)
      ).toBeInTheDocument();
    });
  });
});
