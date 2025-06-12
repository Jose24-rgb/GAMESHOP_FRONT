import React, { useEffect, useState } from 'react';
import api from '../services/apis';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        
        const response = await api.get(`/orders/${user.id}`); 
        setOrders(response.data);
      } catch (err) {
        console.error('❌ Errore nel recupero degli ordini:', err);
        
        setError('Impossibile recuperare gli ordini. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) { 
        fetchOrders();
    } else {
        setLoading(false); 
    }
  }, [user, navigate]);

  const getStatusBadge = (status) => {
    const base = 'px-2 py-1 rounded text-white fw-bold';
    switch (status) {
      case 'pagato':
        return <span className={`${base} bg-success`}>✅ Pagato</span>;
      case 'fallito':
        return <span className={`${base} bg-danger`}>❌ Fallito</span>;
      case 'in_attesa_verifica':
        return <span className={`${base} bg-warning text-dark`}>⏳ In attesa</span>;
      default:
        return <span className={`${base} bg-secondary`}>{status}</span>;
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Caricamento ordini...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5 text-center">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center mt-5">Non hai ancora effettuato ordini.</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📦 I miei ordini</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Giochi</th> 
              <th>ID Ordine</th>
              <th>Data e Ora</th>
              <th>Totale</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.gameTitles}</td> 
                <td>{order._id}</td>
                <td>
                  {new Date(order.date).toLocaleString('it-IT', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
                <td>€ {order.total.toFixed(2)}</td>
                <td>{getStatusBadge(order.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;






