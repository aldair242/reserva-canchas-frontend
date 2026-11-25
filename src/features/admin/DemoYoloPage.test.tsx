import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DemoYoloPage } from './DemoYoloPage';
import * as endpoints from '@/api/endpoints';

describe('DemoYoloPage', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('renderiza la insignia de MODULO SIMULADO y los controles de inferencia', () => {
    vi.spyOn(endpoints, 'useListarMisPartidos').mockReturnValue({
      data: [
        {
          id: 11,
          nombreEquipoA: 'Equipo A',
          nombreEquipoB: 'Equipo B',
          estado: 'EN_JUEGO',
          golesEquipoA: 1,
          golesEquipoB: 0,
        },
      ],
      isLoading: false,
    } as any);

    vi.spyOn(endpoints, 'useObtenerPorId1').mockReturnValue({
      data: {
        id: 11,
        nombreEquipoA: 'Equipo A',
        nombreEquipoB: 'Equipo B',
        estado: 'EN_JUEGO',
        golesEquipoA: 1,
        golesEquipoB: 0,
      },
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DemoYoloPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/MÓDULO SIMULADO/i)).toBeInTheDocument();
    expect(screen.getByText(/Parámetros de Detección/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Disparar Detección \(Por Partido\)/i })).toBeInTheDocument();
  });
});
