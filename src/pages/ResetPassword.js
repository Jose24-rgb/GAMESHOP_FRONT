import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/apis'; 

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!email || !token) {
      setMessage('Link non valido.');
    }
  }, [email, token]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
     
      await api.post('/auth/reset-password', {
        email,
        token,
        newPassword,
      });
      setMessage('Password aggiornata. Ora puoi fare il login.');
      setSuccess(true);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Errore durante il reset.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Imposta una nuova password</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="form-control my-2"
          placeholder="Nuova password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary">Reimposta password</button>
      </form>
    </div>
  );
}

export default ResetPassword;

