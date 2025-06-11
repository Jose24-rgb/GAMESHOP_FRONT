import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter, useNavigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';
import '@testing-library/jest-dom';
import api from './services/apis';


jest.mock('./services/apis', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));


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
  
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (
      msg.includes('React Router Future Flag Warning') ||
      msg.includes('Relative route resolution within Splat routes')
    ) {
      return; 
    }
    console.warn(msg); 
  });

  jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  
  console.warn.mockRestore(); 
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
    api.post.mockResolvedValue({
      data: {
        message: 'Registrazione riuscita! Controlla la tua email per la verifica.', 
        userId: 'someUserId'
      }
    }); 

    renderWithRouter(<Register />);
    await userEvent.type(screen.getByPlaceholderText(/username/i), 'newuser');
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'new@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'newpassword');

    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(api.post).toHaveBeenCalledWith(
      '/auth/register',
      {
        username: 'newuser',
        email: 'new@example.com',
        password: 'newpassword',
      }
    );


    expect(window.alert).toHaveBeenCalledWith('Registrazione riuscita! Controlla la tua email per la verifica.');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('mostra errore se la registrazione fallisce', async () => {
    api.post.mockRejectedValue({
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
    api.post.mockResolvedValue({
      data: {
        user: { id: 'user123', email: 'test@example.com', username: 'testuser' },
        token: 'fake-jwt-token',
      },
    });

    renderWithProviders(<Login />);
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'password123');

    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
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
