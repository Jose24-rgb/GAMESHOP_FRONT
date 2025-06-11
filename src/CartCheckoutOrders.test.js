import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import '@testing-library/jest-dom';
import api from './services/apis';

// Mock per useCart
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

// Mock per useAuth
jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', email: 'user@example.com' }, // Aggiunto email qui
    token: 'fake-token', // Potrebbe servire per isAuthenticated
    isAuthenticated: true, // Aggiunto per coerenza
  }),
}));

// Mock per l'istanza 'api'
jest.mock('./services/apis', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));


beforeAll(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  // Imposta window.location per essere una proprietà scrivibile
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { href: '' }
  });
});

afterEach(() => {
  jest.clearAllMocks();
  // Resetta window.location.href dopo ogni test
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
        email: 'user@example.com', // AGGIUNTO: L'email viene inviata
        games: [ // AGGIUNTO: Specifica l'array esatto, non solo Any<Array>
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
      // Questo test del componente Checkout si basa su un'assunzione di come il componente riceve i dati.
      // Assicurati che i dati mockati (userId, email, games) corrispondano a quelli che Checkout userebbe.
      expect(api.post).toHaveBeenCalledWith('/checkout/create-checkout-session', {
        userId: 'user123',
        email: 'user@example.com', // AGGIUNTO: L'email viene inviata anche da Checkout
        games: [ // AGGIUNTO: Specifica l'array esatto
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
        // Includi i dettagli dei giochi nell'ordine, se il componente Orders li aspetta per il rendering
        games: [{ 
            _id: 'game1', // ID del gioco nel mock dell'ordine
            title: 'Mock Game Title', // Titolo del gioco nel mock dell'ordine
            price: 49.99,
            quantity: 1
        }]
      },
    ];

    api.get.mockResolvedValue({ data: mockOrders });

    render(<Orders />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/orders/user123'); // Verifica la chiamata API corretta
      expect(screen.getByText(/ord123/i)).toBeInTheDocument();
      expect(screen.getByText(/€ 49.99/i)).toBeInTheDocument();
      expect(screen.getByText(/✅ Pagato/i)).toBeInTheDocument();
      // Se il componente Orders mostra anche il titolo del gioco, potresti volerlo aggiungere qui:
      // expect(screen.getByText(/Mock Game Title/i)).toBeInTheDocument();
    });
  });

  test('gestisce il caricamento e l’assenza di ordini', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<Orders />);
    expect(screen.getByText(/caricamento/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/orders/user123'); // Verifica la chiamata API corretta
      expect(screen.getByText(/non hai ancora effettuato ordini/i)).toBeInTheDocument();
    });
  });
});