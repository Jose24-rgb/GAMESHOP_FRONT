import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import '@testing-library/jest-dom';
import axios from 'axios';


jest.mock('axios');


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


function renderWithRouter(ui, route = '/register') {
  const router = createMemoryRouter(
    [
      {
        path: route,
        element: ui,
      },
    ],
    {
      initialEntries: [route],
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

  return render(<RouterProvider router={router} />);
}


function renderWithProviders(ui, route = '/login') {
  const router = createMemoryRouter(
    [
      {
        path: route,
        element: <AuthProvider>{ui}</AuthProvider>,
      },
    ],
    {
      initialEntries: [route],
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

  return render(<RouterProvider router={router} />);
}


beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});


describe('Register component', () => {
  test('renderizza i campi richiesti', () => {
    renderWithRouter(<Register />);
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('invio corretto dei dati', async () => {
    axios.post.mockResolvedValue({});

    renderWithRouter(<Register />);
    await userEvent.type(screen.getByPlaceholderText(/username/i), 'newuser');
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'newpassword');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/auth/register`,
      {
        username: 'newuser',
        email: 'new@example.com',
        password: 'newpassword',
      }
    );

    expect(window.alert).toHaveBeenCalledWith('Registrazione riuscita!');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('mostra errore se la registrazione fallisce', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: { error: 'Email già in uso' },
      },
    });

    renderWithRouter(<Register />);
    await userEvent.type(screen.getByPlaceholderText(/username/i), 'failuser');
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'fail@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'failpass');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(window.alert).toHaveBeenCalledWith('Email già in uso');
  });
});


describe('Login component', () => {
  test('rende i campi email, password e il pulsante login', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('invia i dati al submit se i campi sono riempiti', async () => {
    axios.post.mockResolvedValue({
      data: {
        user: { id: 1, email: 'test@example.com' },
        token: 'fake-jwt-token',
      },
    });

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'password123');

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/auth/login`,
      {
        email: 'test@example.com',
        password: 'password123',
      }
    );
  });

  test('mostra errore se si invia senza compilare', async () => {
    renderWithProviders(<Login />);
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    expect(window.alert).toHaveBeenCalled();
  });
});

