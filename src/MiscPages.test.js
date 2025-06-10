import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Cancel from './pages/Cancel';
import Success from './pages/Success';
import VerifyEmail from './pages/VerifyEmail';
import * as CartContext from './context/CartContext';
import api from './services/apis';

// Mock API
jest.mock('./services/apis', () => ({
  get: jest.fn(),
}));

// Mock useCart in modo sicuro prima di ogni test
beforeEach(() => {
  jest.spyOn(CartContext, 'useCart').mockReturnValue({
    clearCart: jest.fn(),
  });
});

describe('Cancel Page', () => {
  it('renders cancel message correctly', () => {
    render(
      <MemoryRouter>
        <Cancel />
      </MemoryRouter>
    );
    expect(screen.getByText(/Pagamento annullato o fallito/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Torna al carrello/i })).toBeInTheDocument();
  });
});

describe('Success Page', () => {
  it('renders success message and orderId', () => {
    render(
      <MemoryRouter initialEntries={['/success?orderId=12345']}>
        <Routes>
          <Route path="/success" element={<Success />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Pagamento completato con successo/i)).toBeInTheDocument();
    expect(screen.getByText(/ID Ordine/i)).toBeInTheDocument();
  });
});

describe('VerifyEmail Page', () => {
  it('renders success if verification works', async () => {
    api.get.mockResolvedValueOnce({ data: { message: 'Verifica completata' } });

    render(
      <MemoryRouter initialEntries={['/verify-email?email=test@example.com&token=abc123']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Verifica in corso/i)).toBeInTheDocument();
    await waitFor(() => screen.getByText(/Email verificata con successo/i), { timeout: 3000 });
  });

  it('renders error on invalid or expired token', async () => {
    api.get.mockRejectedValueOnce(new Error('Errore'));

    render(
      <MemoryRouter initialEntries={['/verify-email?email=test@example.com&token=wrong']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText(/Errore nella verifica/i), { timeout: 3000 });
  });

  it('renders invalid when email/token is missing', () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Link non valido/i)).toBeInTheDocument();
  });
});
