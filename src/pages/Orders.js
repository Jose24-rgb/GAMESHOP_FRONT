import { useEffect, useState } from 'react';
import api from '../services/axios'; 
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders/${user.id}`); 
        setOrders(res.data);
      } catch (err) {
        console.error('❌ Errore nel recupero degli ordini:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchOrders(); 
  }, [user?.id]);

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

  if (loading) return <p>Caricamento ordini...</p>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📦 I miei ordini</h2>
      {orders.length === 0 ? (
        <p>Non hai ancora effettuato ordini.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID Ordine</th>
                <th>Data e Ora</th>
                <th>Totale</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
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
      )}
    </div>
  );
};

export default Orders;




