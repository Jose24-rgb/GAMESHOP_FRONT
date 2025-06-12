import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/apis'; 

const Cancel = () => {
  const location = useLocation();
  const [orderId, setOrderId] = useState(null);
  const [gameTitles, setGameTitles] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get('orderId');
    setOrderId(idFromUrl);

    if (idFromUrl) {
      const fetchOrderDetails = async () => {
        try {
     
          const response = await api.get(`/orders/public/${idFromUrl}`);
          setGameTitles(response.data.gameTitles); 
          setError(''); 
        } catch (err) {
          console.error('❌ Errore nel recupero dettagli ordine annullato:', err);
          setError(err.response?.data?.error || 'Impossibile recuperare i dettagli dell\'ordine.');
          setGameTitles('N/A');
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails(); 
    } else {
      setLoading(false); 
      setError('Nessun ID ordine trovato.');
    }
  }, [location.search]);

  return (
    <div className="container mt-5 text-center">
      <h2>❌ Pagamento annullato o fallito</h2>
      {loading ? (
        <p>Caricamento dettagli ordine...</p>
      ) : (
        <>
          {orderId && (
            <p>
              ID Ordine: <strong>{orderId}</strong>
            </p>
          )}
          {gameTitles && gameTitles !== 'N/A' && (
            <p>
              Giochi: <strong>{gameTitles}</strong>
            </p>
          )}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          
          <p>Il tuo pagamento non è andato a buon fine. Nessun importo è stato addebitato.</p>
          <p>Puoi riprovare o tornare al carrello per modificare l'ordine.</p>
        </>
      )}
      
      <Link to="/cart" className="btn btn-warning mt-3">
        Torna al carrello
      </Link>
    </div>
  );
};

export default Cancel;


