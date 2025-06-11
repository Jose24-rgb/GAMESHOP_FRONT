import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/apis'; // MODIFICATO: Importa l'istanza 'api' da apis.js

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // MODIFICATO: Usa 'api.post' con il percorso relativo.
      // La baseURL in apis.js si occuperà di aggiungere il prefisso corretto.
      await api.post('/auth/register', form);
      alert('Registrazione riuscita! Controlla la tua email per la verifica.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.error || 'Errore registrazione');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control my-2" name="username" placeholder="Username" onChange={handleChange} />
        <input className="form-control my-2" name="email" placeholder="Email" onChange={handleChange} />
        <input className="form-control my-2" name="password" placeholder="Password" type="password" onChange={handleChange} />
        <button className="btn btn-success">Register</button>
      </form>
    </div>
  );
}

export default Register;
