import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminGameList from './pages/AdminGameList';
import AdminCreateGame from './pages/AdminCreateGame';
import AdminEditGame from './pages/AdminEditGame';
import api from './services/apis';
import axios from './services/axios';
import { useAuth } from './context/AuthContext';


jest.mock('./services/axios', () => ({
  get: jest.fn(),
  delete: jest.fn(),
  post: jest.fn(),
  put: jest.fn()
}));

jest.mock('./services/apis', () => ({
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  get: jest.fn()
}));


jest.mock('./context/AuthContext', () => ({
  useAuth: jest.fn()
}));


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


  window.alert = jest.fn();
  window.confirm = jest.fn(() => true);
});

afterAll(() => {
  console.warn.mockRestore();
  window.alert.mockRestore?.();
  window.confirm.mockRestore?.();
});

describe('AdminGameList component', () => {
  test('mostra messaggio di accesso negato per non admin', () => {
    useAuth.mockReturnValue({ user: { isAdmin: false } });

    render(<AdminGameList />);

    expect(screen.getByText(/accesso negato/i)).toBeInTheDocument();
  });

  test('mostra lista giochi per admin', async () => {
    useAuth.mockReturnValue({ user: { isAdmin: true } });

    axios.get.mockResolvedValue({
      data: [
        {
          _id: '1',
          title: 'Test Game',
          price: 10,
          discount: 0,
          type: 'Gioco',
          platform: 'Steam',
          system: 'PC'
        }
      ]
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminGameList />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/test game/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('AdminCreateGame component', () => {
  test('invia form di creazione', async () => {
    api.post.mockResolvedValue({}); 

    render(
      <MemoryRouter initialEntries={['/admin/create-game']}>
        <Routes>
          <Route path="/admin/create-game" element={<AdminCreateGame />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByPlaceholderText(/titolo/i), 'New Game');
    await userEvent.type(screen.getByPlaceholderText(/genere/i), 'Azione');
    await userEvent.type(screen.getByPlaceholderText(/prezzo/i), '20');
    await userEvent.type(screen.getByPlaceholderText(/disponibilità/i), '5');

    const comboBoxes = screen.getAllByRole('combobox');
    await userEvent.selectOptions(comboBoxes[0], 'Steam');
    await userEvent.selectOptions(comboBoxes[1], 'PC');

    await userEvent.click(screen.getByRole('button', { name: /crea gioco/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled(); 
      expect(window.alert).toHaveBeenCalledWith('Gioco creato con successo!');
    });
  });
});


describe('AdminEditGame component', () => {
  test('carica dati gioco e mostra il titolo', async () => {
    const mockGame = {
      _id: '1',
      title: 'Game Edit',
      genre: 'RPG',
      price: 30,
      discount: 5,
      stock: 10,
      platform: 'Epic Games',
      system: 'PC',
      type: 'Gioco',
      description: 'Desc',
      trailerUrl: '',
      dlcLink: '',
      baseGameLink: '',
      preorder: false,
      upcoming: false
    };

    api.get.mockResolvedValue({ data: mockGame });

    render(
      <MemoryRouter initialEntries={['/admin/edit-game/1']}>
        <Routes>
          <Route path="/admin/edit-game/:id" element={<AdminEditGame />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(/game edit/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
