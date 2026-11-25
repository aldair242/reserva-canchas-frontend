import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/AuthContext';
import { InvitacionDetallePage } from './InvitacionDetallePage';
import * as endpoints from '@/api/endpoints';

describe('InvitacionDetallePage', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('muestra los detalles del partido y botones para unirse', () => {
    vi.spyOn(endpoints, 'useObtenerResumen').mockReturnValue({
      data: {
        partidoId: 99,
        nombreEquipoA: 'Los Galácticos',
        nombreEquipoB: 'La Academia',
        estado: 'PROGRAMADO',
        canchaNombre: 'Cancha Central',
        sedeNombre: 'Sede Principal',
        fecha: '2026-12-10',
        horaInicio: '15:00:00',
        horaFin: '16:00:00',
      },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/invitaciones/TOKEN-123']}>
          <AuthProvider>
            <InvitacionDetallePage />
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getAllByText(/Los Galácticos/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/La Academia/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Cancha Central/i)).toBeInTheDocument();
    expect(screen.getByText(/Unirse al Partido/i)).toBeInTheDocument();
  });
});
