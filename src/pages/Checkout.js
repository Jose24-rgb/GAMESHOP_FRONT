import { useEffect } from 'react'; 
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/apis';

const Checkout = () => {
  const { cart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await api.post('/checkout/create-checkout-session', {
          userId: user?.id,
          email: user?.email,
          games: cart
        });
        window.location.href = res.data.url;
      } catch (err) {
        console.error('Errore Stripe:', err.response?.data?.error || err.message);
        alert('Errore nel checkout. Riprova.');
      }
    };

    if (user && cart.length > 0) {
      createSession();
    }
  }, [user, cart]);

  return <p className="text-center mt-5">🔄 Reindirizzamento a Stripe...</p>;
};

export default Checkout;
