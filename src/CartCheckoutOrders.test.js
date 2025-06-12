import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import '@testing-library/jest-dom';
import api from './services/apis';


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
    token: 'fake-token',
    isAuthenticated: true,
  }),
}));


jest.mock('./services/apis', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));


beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});

  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' }
  });
});

afterEach(() => {
  jest.clearAllMocks();

  window.location.href = '';
});

describe('Cart component', () => {
  test('renderizza correttamente i giochi nel carrello e il totale', () => {
    render(<Cart />);
    expect(screen.getByText(/Test Game/i)).toBeInTheDocument();
    expect(screen.getByText(/Totale: € 90.00/i)).toBeInTheDocument();
  });

  test('invoca l\'API di checkout al click sul pulsante', async () => {
    api.post.mockResolvedValue({ data: { url: 'https://stripe.com/fake' } });

    render(<Cart />);
    await userEvent.click(screen.getByRole('button', { name: /stripe/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/checkout/create-checkout-session', {
        userId: 'user123',
        email: 'user@example.com',
        games: [
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
        games: [
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
    
        gameTitles: ['Mock Game Title'], 
        games: [{
            _id: 'game1',
            title: 'Mock Game Title',
            price: 49.99,
            quantity: 1
        }]
      },
    ];

    api.get.mockResolvedValue({ data: mockOrders });

   
    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/orders/user123');
      expect(screen.getByText(/ord123/i)).toBeInTheDocument();
      expect(screen.getByText(/€ 49.99/i)).toBeInTheDocument();
      expect(screen.getByText(/✅ Pagato/i)).toBeInTheDocument();
     
      expect(screen.getByText(/Mock Game Title/i)).toBeInTheDocument();
    });
  });

  test('gestisce il caricamento e l’assenza di ordini', async () => {
    api.get.mockResolvedValue({ data: [] });

    
    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );
    expect(screen.getByText(/caricamento/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/orders/user123');
      expect(screen.getByText(/non hai ancora effettuato ordini/i)).toBeInTheDocument();
    });
  });
});
