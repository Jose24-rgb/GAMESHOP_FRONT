import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axios'; // <-- usa il client axios con interceptor
import { useAuth } from '../context/AuthContext';

const AdminGameList = () => {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = async () => {
    try {
      const res = await api.get('/games');
      setGames(res.data);
    } catch (err) {
      console.error('Errore nel recupero giochi:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo gioco?')) return;

    try {
      await api.delete(`/games/${id}`);
      setGames(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      console.error('Errore durante eliminazione:', err);
      alert('Errore nell\'eliminazione del gioco.');
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchGames();
    }
  }, [user]);

  if (!user?.isAdmin) return <p className="text-danger">Accesso negato.</p>;

  if (loading) return <p>Caricamento giochi...</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">🎮 Gestione Giochi (Admin)</h2>
      <Link to="/admin/create-game" className="btn btn-success mb-3">
        ➕ Crea nuovo gioco
      </Link>

      {games.length === 0 ? (
        <p>Nessun gioco disponibile.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Titolo</th>
              <th>Prezzo</th>
              <th>Sconto</th>
              <th>Tipo</th>
              <th>Piattaforma</th>
              <th>Sistema</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game._id}>
                <td>{game.title}</td>
                <td>€ {game.price.toFixed(2)}</td>
                <td>{game.discount ? `${game.discount}%` : '—'}</td>
                <td>{game.type || '—'}</td>
                <td>{game.platform || '—'}</td>
                <td>{game.system || '—'}</td>
                <td>
                  <Link
                    to={`/admin/edit-game/${game._id}`}
                    className="btn btn-warning btn-sm me-2"
                  >
                    ✏️ Modifica
                  </Link>
                  <button
                    onClick={() => handleDelete(game._id)}
                    className="btn btn-danger btn-sm"
                  >
                    🗑️ Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminGameList;

