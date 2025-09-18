import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPage.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/complete-profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>⚡ BrainBlitz</h1>
          <h2>¡Únete a la diversión!</h2>
          <p>Crea tu cuenta y comienza a jugar</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="input-group">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
