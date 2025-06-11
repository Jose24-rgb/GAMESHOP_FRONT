import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/apis';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      setStatus('invalid');
      return;
    }

    const verify = async () => {
      try {
       
        const res = await api.get('/auth/verify-email', {
          params: { email, token }
        });
        const msg = res.data.message;
        if (msg.includes('già verificata')) {
          setStatus('already');
        } else {
          setStatus('success');
        }
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        setStatus('error');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="container mt-5">
      {status === 'loading' && <p>Verifica in corso...</p>}
      {status === 'success' && <p>Email verificata con successo! Reindirizzamento al login...</p>}
      {status === 'error' && <p>Errore nella verifica. Il token potrebbe essere scaduto o non valido.</p>}
      {status === 'invalid' && <p>Link non valido.</p>}
      {status === 'already' && <p>Email già verificata. Reindirizzamento al login...</p>}
    </div>
  );
}

export default VerifyEmail;

