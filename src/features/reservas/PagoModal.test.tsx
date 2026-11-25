import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PagoModal } from './components/PagoModal';
import type { ReservaResponse } from '@/api/model/reservaResponse';
import * as endpoints from '@/api/endpoints';

const mockReserva: ReservaResponse = {
  id: 15,
  codigo: 'RES-PAGO-01',
  fecha: '2026-10-18',
  horaInicio: '18:00:00',
  horaFin: '19:00:00',
  precioTotal: 75.0,
  canchaNombre: 'Cancha Básquet Central',
  estado: 'PENDIENTE',
};

const renderPagoModal = ({
  onClose = vi.fn(),
  onSuccess = vi.fn(),
}: {
  onClose?: () => void;
  onSuccess?: (r: ReservaResponse) => void;
} = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PagoModal
        reserva={mockReserva}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </QueryClientProvider>
  );
};

describe('PagoModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza métodos de pago, datos de la reserva y el monto total', () => {
    renderPagoModal();

    expect(screen.getByText('Pagar Reserva')).toBeInTheDocument();
    expect(screen.getByText('Cancha Básquet Central')).toBeInTheDocument();
    expect(screen.getByText('S/ 75.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tarjeta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /billetera/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transferencia/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /efectivo/i })).toBeInTheDocument();
  });

  it('valida que los últimos 4 dígitos sean exactamente 4 caracteres numéricos', async () => {
    const user = userEvent.setup();
    renderPagoModal();

    const ultimosCuatroInput = screen.getByPlaceholderText('4242');
    await user.type(ultimosCuatroInput, '12');

    const btnSubmit = screen.getByRole('button', { name: /confirmar pago/i });
    await user.click(btnSubmit);

    await waitFor(() => {
      expect(
        screen.getByText(/ingresa exactamente los últimos 4 dígitos numéricos/i)
      ).toBeInTheDocument();
    });
  });

  it('permite cambiar a método Billetera y muestra sus campos respectivos', async () => {
    const user = userEvent.setup();
    renderPagoModal();

    const btnBilletera = screen.getByRole('button', { name: /billetera/i });
    await user.click(btnBilletera);

    expect(screen.getByText(/proveedor/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('OP-987654')).toBeInTheDocument();
  });

  it('procesa el pago exitosamente con TARJETA', async () => {
    const user = userEvent.setup();
    const onSuccessMock = vi.fn();

    vi.spyOn(endpoints, 'usePagar').mockImplementation((options) => {
      return {
        mutate: vi.fn().mockImplementation(() => {
          // @ts-expect-error test mock
          options?.mutation?.onSuccess?.(
            {
              ...mockReserva,
              estado: 'CONFIRMADA',
              pagada: true,
            },
            {},
            undefined
          );
        }),
        isPending: false,
      } as unknown as ReturnType<typeof endpoints.usePagar>;
    });

    renderPagoModal({ onSuccess: onSuccessMock });

    const ultimosCuatroInput = screen.getByPlaceholderText('4242');
    await user.type(ultimosCuatroInput, '4242');

    const btnSubmit = screen.getByRole('button', { name: /confirmar pago/i });
    await user.click(btnSubmit);

    await waitFor(() => {
      expect(screen.getByText(/¡pago procesado con éxito!/i)).toBeInTheDocument();
    });
  });
});
