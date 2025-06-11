import { useEffect, useState, useCallback } from 'react';
import api from '../services/apis';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Filters from '../components/Filters';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => {
    const stored = localStorage.getItem('filters');
    return stored ? JSON.parse(stored) : {};
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const searchQuery = searchParams.get('search') || '';

  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [purchasedGames, setPurchasedGames] = useState([]);

  const buildQuery = (obj) => {
    return Object.entries(obj)
      .filter(([_, value]) => value !== '' && value !== null && value !== false)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
  };

  useEffect(() => {
    if (searchQuery || location.state?.resetPage) {
      setCurrentPage(1);
    }
  }, [searchQuery, location.state]);

  useEffect(() => {
    if (location.state?.resetPage) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const query = buildQuery({ ...filters, page: currentPage, limit: 9 });
      
        const res = await api.get(`/games?${query}`);
        setGames(res.data.games);
        setTotalPages(res.data.totalPages);
      } catch (err) {
        console.error('Errore nel recupero giochi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [filters, currentPage]);

  useEffect(() => {
    const fetchPurchased = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/orders/${user.id}`);
        const ids = res.data.flatMap(order =>
          order.games
            .filter(g => g.gameId && typeof g.gameId === 'object')
            .map(g => g.gameId._id)
        );
        setPurchasedGames(ids);
      } catch (err) {
        console.error("Errore nel recupero dei giochi acquistati:", err);
      }
    };

    fetchPurchased();
  }, [user?.id]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    localStorage.setItem('filters', JSON.stringify(newFilters));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo gioco?')) return;
    try {
      await api.delete(`/games/${id}`);
      setGames(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      alert('Errore durante l\'eliminazione');
    }
  };

  const filteredGames = games.filter(game =>
    game.title.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  const isMobile = window.innerWidth < 768;
  const hideFilters = isMobile && searchQuery.trim().length > 0;

  return (
    <div className="container mt-4 mb-5">
      <Filters
        onFilterChange={handleFilterChange}
        defaultFilters={filters}
        hideFilters={hideFilters}
        onResetSearch={() => navigate('/')}
      />

      {!loading && filteredGames.length > 0 && (
        <div className="row mb-3">
          <div className="col-sm-12 col-md-6 d-flex align-items-center mb-2 mb-md-0 results-admin-shift">
            <div className="fw-semibold me-3" style={{ fontSize: '1.1rem' }}>
              {filteredGames.length} {filteredGames.length === 1 ? 'risultato' : 'risultati'}
            </div>
            {user?.isAdmin && (
              <button className="btn btn-success btn-sm" onClick={() => navigate('/admin/create-game')}>
                ➕ Crea Gioco
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <p>Caricamento giochi...</p>
      ) : filteredGames.length === 0 ? (
        <p className="text-muted">Nessun risultato trovato.</p>
      ) : (
        <div className="row gx-3">
          {filteredGames.map((game) => {
            const isComingSoon = game.upcoming === true;
            const rawStock = game.stock ?? 0;
            const isOutOfStock = rawStock === 0 && !isComingSoon;
            const isPreorderAvailable = game.preorder && rawStock > 0;
            const isFreeToPlay = game.price === 0 && !game.discount && rawStock > 0;

            const cartItem = cart.find(c => c._id === game._id);
            const inCartQty = cartItem?.quantity || 0;
            const isDisabled = inCartQty >= rawStock;
            const shouldDisableButton = inCartQty > 0 || isDisabled;

            const hasPurchased = purchasedGames.includes(game._id);

            return (
              <div className="col-12 col-sm-6 col-md-4 mb-4 d-flex justify-content-center" key={game._id}>
                <div className="card game-card p-2 border-0">
                  <div className="position-relative">
                    {hasPurchased && (
                      <div className="position-absolute top-0 start-0 bg-success text-white px-2 py-1 rounded-end">
                        ✅ Ottenuto
                      </div>
                    )}
                    {game.imageUrl && (
                      <img
                        src={game.imageUrl}
                        className="card-img-top img-fluid"
                        alt={game.title}
                      />
                    )}
                  </div>
                  <div className="d-flex flex-column mt-2">
                    <h5 className="card-title mb-2">
                      <Link to={`/games/${game._id}`} className="text-decoration-none">
                        {game.title}
                      </Link>
                    </h5>

                    {!isComingSoon && !isOutOfStock && (
                      <small className="text-muted">📦 Disponibilità: {rawStock}</small>
                    )}

                    <div className="d-grid gap-2 mt-2">
                      {isComingSoon ? (
                        <button className="btn btn-secondary btn-sm w-100" disabled>
                          🕐 Prossimamente
                        </button>
                      ) : isFreeToPlay ? (
                        <button
                          className="btn btn-success btn-sm w-100"
                          onClick={() => addToCart(game)}
                          disabled={shouldDisableButton}
                        >
                          🎮 Ottieni Gratis
                        </button>
                      ) : rawStock > 0 ? (
                        <button
                          className={`btn btn-${isPreorderAvailable ? 'warning' : 'primary'} btn-sm w-100`}
                          onClick={() => addToCart(game)}
                          disabled={shouldDisableButton}
                        >
                          {isPreorderAvailable ? '🔔 Preordina' : '🛒 Aggiungi al carrello'}
                        </button>
                      ) : (
                        <button className="btn btn-secondary btn-sm w-100" disabled>
                          ❌ Non disponibile
                        </button>
                      )}
                    </div>

                    {user?.isAdmin && (
                      <div className="d-flex flex-sm-row flex-column gap-2 mt-2">
                        <button
                          className="btn btn-warning btn-sm admin-btn w-50"
                          onClick={() => navigate(`/admin/edit-game/${game._id}`)}
                        >
                          ✏️ Modifica
                        </button>
                        <button
                          className="btn btn-danger btn-sm admin-btn w-50"
                          onClick={() => handleDelete(game._id)}
                        >
                          🗑️ Elimina
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="d-flex justify-content-center mt-3">
        <button
          className={`btn btn-paginate left ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="arrow">&#60;</span>
        </button>

        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
            <button
              key={pageNumber}
              className={`page-button ${currentPage === pageNumber ? 'active' : ''}`}
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <button
          className={`btn btn-paginate right ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <span className="arrow">&#62;</span>
        </button>
      </div>
    </div>
  );
};

export default Home;




















































