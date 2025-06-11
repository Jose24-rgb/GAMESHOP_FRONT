import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // Carica il carrello dal localStorage quando l'utente cambia o al primo render
  useEffect(() => {
    if (user?.id) {
      const storedCart = localStorage.getItem(`cart_${user.id}`);
      let parsedCart = []; // Inizializza come array vuoto

      try {
        if (storedCart) { // Se c'è qualcosa nel localStorage
          const tempParsed = JSON.parse(storedCart);
          // Verifica che il valore parsato sia effettivamente un array
          if (Array.isArray(tempParsed)) {
            parsedCart = tempParsed;
          } else {
            console.warn("Dati carrello non validi nel localStorage, reset a array vuoto:", storedCart);
            // Non settiamo 'parsedCart' qui per mantenere l'array vuoto di default
          }
        }
      } catch (e) {
        console.error("Errore nel parsing del carrello dal localStorage, reset a array vuoto:", e);
        // Non settiamo 'parsedCart' qui per mantenere l'array vuoto di default
      }
      setCart(parsedCart);
    } else {
      setCart([]); // Se l'utente non è loggato, il carrello è vuoto
    }
  }, [user]); // Dipende dall'oggetto utente

  // Salva il carrello nel localStorage ogni volta che il carrello o l'utente cambiano
  useEffect(() => {
    if (user?.id) {
      // Salva come stringa JSON dell'array
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart)); 
    }
  }, [cart, user]); // Dipende dal carrello e dall'utente

  const addToCart = (game) => {
    setCart(prev => {
      // Prev è garantito essere un array grazie alla logica di useEffect sopra
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



