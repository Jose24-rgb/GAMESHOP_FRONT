import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import api from '../services/apis';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

function Cart() {
  const { cart, removeFromCart } = useCart();
  const { user } = useAuth();

  const total = cart.reduce((acc, game) => {
    const finalPrice = game.discount > 0
      ? game.price * (1 - game.discount / 100)
      : game.price;
    return acc + finalPrice * game.quantity;
  }, 0);

  const handleCheckout = async () => {
    if (!user) {
      alert('Devi effettuare il login per procedere.');
      return;
    }

    try {
      console.log('🔁 Inizio checkout con:', user.id, cart);

      const res = await api.post('/checkout/create-checkout-session', {
        userId: user.id,
        games: cart,
      });

      window.location.href = res.data.url;
    } catch (err) {
      console.error('❌ Errore nel checkout:', err);
      alert('Errore nel processo di pagamento.');
    }
  };

  const isComingSoon = (game) => {
    const stockValue = typeof game.stock === 'number' ? game.stock : parseInt(game.stock, 10) || 0;
    return stockValue === 0 && game.preorder === true;
  };

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center text-md-start mb-4">🛒 Il tuo carrello</h2>

      {cart.length === 0 ? (
        <p className="text-muted">
          Il carrello è vuoto. <Link to="/">Torna alla home</Link>
        </p>
      ) : (
        <>
          <div className="table-responsive">
            <ul className="list-group mb-4">
              {cart.map((game, index) => {
                const pricePerItem = game.discount > 0
                  ? game.price * (1 - game.discount / 100)
                  : game.price;

                const comingSoon = isComingSoon(game);

                return (
                  <li
                    key={index}
                    className="list-group-item cart-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2"
                  >
                    <div className="w-100">
                      <strong>{game.title}</strong>
                      {comingSoon && (
                        <span className="badge bg-warning text-dark ms-2">Preordine</span>
                      )}
                      <br />
                      {game.discount > 0 ? (
                        <>
                          <span className="text-muted text-decoration-line-through">
                            € {game.price.toFixed(2)}
                          </span>{' '}
                          <span className="text-success fw-bold">
                            € {pricePerItem.toFixed(2)} (-{game.discount}%)
                          </span>{' '}
                          × {game.quantity}
                        </>
                      ) : (
                        <>€ {game.price.toFixed(2)} × {game.quantity}</>
                      )}
                    </div>
                    <button
                      className="btn btn-danger btn-sm mt-2 mt-md-0 cart-remove-btn"
                      onClick={() => removeFromCart(game._id)}
                    >
                      Rimuovi
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <h4 className="text-end">Totale: € {total.toFixed(2)}</h4>
          <button className="btn btn-success w-100 mt-3" onClick={handleCheckout}>
            Procedi al pagamento con Stripe
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;







