import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // Carica carrello dal localStorage al login
  useEffect(() => {
    if (user?.id) {
      const storedCart = localStorage.getItem(`cart_${user.id}`);
      setCart(storedCart ? JSON.parse(storedCart) : []);
    } else {
      setCart([]);
    }
  }, [user]);

  // Salva carrello nel localStorage quando cambia
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = (game) => {
    setCart(prev => {
      const existing = prev.find(g => g._id === game._id);

      const stock = typeof game.stock === 'number'
        ? game.stock
        : parseInt(game.stock, 10) || 0;

      if (stock <= 0) {
        alert(`"${game.title}" non è attualmente disponibile.`);
        return prev;
      }

      if (existing) {
        if (existing.quantity >= stock) {
          alert(`Hai già aggiunto tutte le copie disponibili di "${game.title}".`);
          return prev;
        }
        return prev.map(g =>
          g._id === game._id
            ? { ...g, quantity: g.quantity + 1 }
            : g
        );
      } else {
        return [...prev, { ...game, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(game => game._id !== id));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);




