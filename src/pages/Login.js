import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/apis'; 
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      login({
        user: res.data.user,
        token: res.data.token,
      });

      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Login fallito');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4">🔐 Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control my-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="form-control my-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary w-100 mt-3">Login</button>
      </form>

      <div className="mt-3 text-center">
        <p>
          <Link to="/forgot-password" className="text-decoration-none">
            Hai dimenticato la password?
          </Link>
        </p>
        <p className="text-muted">
          Non hai un account?{' '}
          <Link to="/register" className="text-decoration-none">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;



