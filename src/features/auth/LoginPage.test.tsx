import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthContext';
import { LoginPage } from './LoginPage';

const renderLoginPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  it('renderiza los campos de correo, contraseña y el botón de ingreso', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('muestra errores de validación si se envía el formulario vacío', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: /ingresar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/el correo electrónico es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña es obligatoria/i)).toBeInTheDocument();
    });
  });

  it('muestra error de validación cuando el correo tiene formato inválido', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    await user.type(emailInput, 'correo-invalido');

    const submitBtn = screen.getByRole('button', { name: /ingresar/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/ingresa un correo electrónico válido/i)).toBeInTheDocument();
    });
  });
});
