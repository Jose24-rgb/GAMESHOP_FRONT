// MOCK ROUTER
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  useSearchParams: () => [new URLSearchParams(''), jest.fn()],
}));

// MOCK CONTEXTS E COMPONENTI
jest.mock('./context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('./context/CartContext', () => ({ useCart: jest.fn() }));
jest.mock('./services/axios');
jest.mock('./components/UserMenu', () => () => <div data-testid="mock-user-menu">Mocked UserMenu</div>);

// ORA importiamo i moduli reali
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';
import Navbar from './components/Navbar';
import Filters from './components/Filters';
import GameDetail from './pages/GameDetail';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import api from './services/axios';

beforeEach(() => {
  jest.clearAllMocks();
});

//
// NAVBAR TESTS
//
describe('Navbar', () => {
  test('renders navbar with cart count and user menu', () => {
    useAuth.mockReturnValue({ user: { username: 'testuser' }, logout: jest.fn() });
    useCart.mockReturnValue({ cart: [{ id: 1, quantity: 2 }, { id: 2, quantity: 3 }] });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    const cartIcons = screen.getAllByLabelText(/vai al carrello/i);
    expect(cartIcons).toHaveLength(2); // desktop + mobile

    const searchInputs = screen.getAllByPlaceholderText(/cerca gioco/i);
    expect(searchInputs).toHaveLength(2); // desktop + mobile

    expect(screen.getByText('🎮 GAMESHOP')).toBeInTheDocument();

    const userMenus = screen.getAllByTestId('mock-user-menu');
    expect(userMenus).toHaveLength(2); // desktop + mobile
  });
});


//
// FILTERS TESTS
//
describe('Filters', () => {
  test('calls onFilterChange when input changes', () => {
    const onFilterChange = jest.fn();
    render(<Filters onFilterChange={onFilterChange} />);

    const priceMin = screen.getByPlaceholderText(/min/i);
    fireEvent.change(priceMin, { target: { value: '10' } });

    expect(onFilterChange).toHaveBeenCalled();
  });

  test('reset button clears filters', async () => {
    const onFilterChange = jest.fn();
    render(<Filters onFilterChange={onFilterChange} />);

    const priceMax = screen.getByPlaceholderText(/max/i);
    fireEvent.change(priceMax, { target: { value: '99' } });

    const resetButton = screen.getByTitle(/reset filtri/i);
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(priceMax.value).toBe('');
    });
  });
});

//
// GAME DETAIL TESTS
//
describe('GameDetail', () => {
  test('renders loading state, then game info', async () => {
    useAuth.mockReturnValue({ user: { id: '123', isAdmin: false } });

    api.get.mockImplementation((url) => {
      if (url.startsWith('/games/')) {
        return Promise.resolve({
          data: {
            _id: '1',
            title: 'Game 1',
            price: 20,
            discount: 0,
            imageUrl: '',
            stock: 10,
          },
        });
      }
      if (url.startsWith('/reviews/')) {
        return Promise.resolve({ data: [] });
      }
    });

    const router = createMemoryRouter(
      [
        {
          path: '/game/:id',
          element: <GameDetail />,
        },
      ],
      {
        initialEntries: ['/game/1'],
        future: {
          v7_startTransition: true,
        },
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText(/caricamento/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/game 1/i)).toBeInTheDocument();
    });
  });
});
