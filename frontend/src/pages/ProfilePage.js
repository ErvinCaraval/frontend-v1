

import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [apiError, setApiError] = useState('');
  const [apiRaw, setApiRaw] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      let statsData = null;
      try {
        const apiBase = process.env.REACT_APP_API_URL;
        // Obtener el token de Firebase
        const token = user && (await user.getIdToken());
        const statsRes = await fetch(`${apiBase}/api/users/me/stats?uid=${user.uid}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json'
            }
          }
        );
        if (statsRes.ok) {
          statsData = await statsRes.json();
          setApiRaw(statsData);
        } else {
          setApiError(`Error HTTP: ${statsRes.status}`);
        }
      } catch (err) {
        setApiError('Error de conexión: ' + err.message);
      }
      setStats(statsData?.stats || null);
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  if (loading) return <div className="profile-loading">Cargando perfil...</div>;
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user?.uid || 'user'}`}
            alt="avatar"
            className="profile-avatar"
          />
          <div>
            <h2>{user?.displayName || user?.email}</h2>
            <span className="profile-uid">UID: {user?.uid}</span>
          </div>
        </div>
        <div className="profile-stats">
          <h3>Estadísticas</h3>
          {apiError && (
            <div className="error-message">{apiError}</div>
          )}
          {stats ? (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Partidas jugadas</span>
                <span className="stat-value">{stats.gamesPlayed}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Victorias</span>
                <span className="stat-value">{stats.wins}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Respuestas correctas</span>
                <span className="stat-value">{stats.correctAnswers}</span>
              </div>
            </div>
          ) : (
            <>
              <p>No hay estadísticas.</p>
              {apiRaw && (
                <details>
                  <summary>Respuesta de la API</summary>
                  <pre>{JSON.stringify(apiRaw, null, 2)}</pre>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
