import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import '@testing-library/jest-dom';
import api from './services/apis'; // usato per Cart e Checkout

// ✅ Mock del contesto
jest.mock('./context/CartContext', () => ({
  useCart: () => ({
    cart: [
      {
        _id: '1',
        title: 'Test Game',
        price: 50,
        discount: 10,
        quantity: 2,
        stock: 10,
        preorder: false,
      },
    ],
    removeFromCart: jest.fn(),
  }),
}));

jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', email: 'user@example.com' },
  }),
}));

// ✅ Mock dell'API
jest.mock('./services/apis', () => ({
  post: jest.fn(),
}));

jest.mock('./services/axios', () => ({
  get: jest.fn(),
}));

// ✅ Mock di alert e location.href
beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  delete window.location;
  window.location = { href: '' };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Cart component', () => {
  test('renderizza correttamente i giochi nel carrello e il totale', () => {
    render(<Cart />);
    expect(screen.getByText(/Test Game/i)).toBeInTheDocument();
    expect(screen.getByText(/Totale: € 90.00/i)).toBeInTheDocument(); // (50 - 10%) * 2
  });

  test('invoca l\'API di checkout al click sul pulsante', async () => {
    api.post.mockResolvedValue({ data: { url: 'https://stripe.com/fake' } });

    render(<Cart />);
    await userEvent.click(screen.getByRole('button', { name: /stripe/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/checkout/create-checkout-session', {
        userId: 'user123',
        games: expect.any(Array),
      });
      expect(window.location.href).toBe('https://stripe.com/fake');
    });
  });
});

describe('Checkout component', () => {
  test('esegue automaticamente la creazione della sessione Stripe', async () => {
    api.post.mockResolvedValue({ data: { url: 'https://stripe.com/session' } });

    render(<Checkout />);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/checkout/create-checkout-session', {
        userId: 'user123',
        email: 'user@example.com',
        games: expect.any(Array),
      });
      expect(window.location.href).toBe('https://stripe.com/session');
    });
  });
});

describe('Orders component', () => {
  test('visualizza gli ordini dopo il fetch', async () => {
    const mockOrders = [
      {
        _id: 'ord123',
        date: new Date().toISOString(),
        total: 49.99,
        status: 'pagato',
      },
    ];

    const axios = require('./services/axios');
    axios.get.mockResolvedValue({ data: mockOrders });

    render(<Orders />);

    await waitFor(() => {
      expect(screen.getByText(/ord123/i)).toBeInTheDocument();
      expect(screen.getByText(/€ 49.99/i)).toBeInTheDocument();
      expect(screen.getByText(/✅ Pagato/i)).toBeInTheDocument();
    });
  });

  test('gestisce il caricamento e l’assenza di ordini', async () => {
    const axios = require('./services/axios');
    axios.get.mockResolvedValue({ data: [] });

    render(<Orders />);
    expect(screen.getByText(/caricamento/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/non hai ancora effettuato ordini/i)).toBeInTheDocument();
    });
  });
});
