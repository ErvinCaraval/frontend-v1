import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function CompleteProfilePage() {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!auth.currentUser) throw new Error('No autenticado');
      await updateProfile(auth.currentUser, { displayName });
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: auth.currentUser.email,
        displayName,
        stats: { gamesPlayed: 0, wins: 0, correctAnswers: 0 }
      }, { merge: true });
      navigate('/dashboard');
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
          <h1>Completa tu perfil</h1>
          <p>Elige tu nombre para mostrar</p>
        </div>
        <form onSubmit={handleSave} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Nombre para mostrar"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
}
