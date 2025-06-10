import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import '@testing-library/jest-dom';
import api from './services/apis';
import axios from './services/axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';


jest.mock('./services/apis', () => ({
  post: jest.fn(),
}));

jest.mock('./services/axios', () => ({
  post: jest.fn(),
}));


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


jest.setTimeout(15000);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ForgotPassword component', () => {
  test('invia email e mostra messaggio di successo', async () => {
    api.post.mockResolvedValue({});

    render(<ForgotPassword />);

    await userEvent.type(screen.getByPlaceholderText(/email/i), 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /invia/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/request-reset', {
        email: 'user@example.com',
      });
      expect(screen.getByText(/email inviata/i)).toBeInTheDocument();
    });
  });

  test('gestisce errore API', async () => {
    api.post.mockRejectedValue({ response: { data: { error: 'Email non trovata' } } });

    render(<ForgotPassword />);
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'fail@example.com');
    await userEvent.click(screen.getByRole('button', { name: /invia/i }));

    await waitFor(() => {
      expect(screen.getByText(/email non trovata/i)).toBeInTheDocument();
    });
  });
});

describe('ResetPassword component', () => {
  const renderWithParams = (search = '') => {
    render(
      <MemoryRouter initialEntries={[`/reset${search}`]}>
        <Routes>
          <Route path="/reset" element={<ResetPassword />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('mostra errore se manca email/token', () => {
    renderWithParams();
    expect(screen.getByText(/link non valido/i)).toBeInTheDocument();
  });

  test('reimposta la password correttamente', async () => {
    axios.post.mockResolvedValue({});

    renderWithParams('?email=test@example.com&token=123abc');

    await userEvent.type(screen.getByPlaceholderText(/nuova password/i), 'newpass123');

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /reimposta/i }));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/auth/reset-password', {
        email: 'test@example.com',
        token: '123abc',
        newPassword: 'newpass123',
      });
      expect(screen.getByText(/password aggiornata/i)).toBeInTheDocument();
    });

    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });

  test('gestisce errore durante il reset', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'Token scaduto' } } });

    renderWithParams('?email=test@example.com&token=expiredtoken');

    await userEvent.type(screen.getByPlaceholderText(/nuova password/i), 'newpass123');

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /reimposta/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(/token scaduto/i)).toBeInTheDocument();
    });
  });
});

  
