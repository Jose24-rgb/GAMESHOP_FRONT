import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Success = () => {
  const location = useLocation();
  const { clearCart } = useCart();

  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');

  useEffect(() => {
    clearCart();
    setTimeout(() => {
      window.location.href = '/orders';
    }, 2000);
  }, [clearCart]);

  return (
    <div className="container mt-5 text-center">
      <h2>✅ Pagamento completato con successo</h2>
      <p>Grazie per il tuo acquisto. Il tuo ordine è stato registrato.</p>

      {orderId && (
        <p>
          ID Ordine: <strong>{orderId}</strong>
        </p>
      )}

      <p>Verrai reindirizzato alla pagina dei tuoi ordini tra pochi secondi...</p>

      <button
        className="btn btn-primary mt-3"
        onClick={() => window.location.href = '/orders'}
      >
        Vai ai miei ordini ora
      </button>
    </div>
  );
};

export default Success;


