import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">⚡ BrainBlitz</h1>
        <p className="hero-subtitle">La experiencia definitiva de trivia multijugador</p>
        
        {user ? (
          <div className="user-actions">
            <Link to="/dashboard" className="btn btn-primary">Ir al panel</Link>
            <Link to="/profile" className="btn btn-secondary">Ver perfil</Link>
          </div>
        ) : (
          <div className="auth-actions">
            <Link to="/login" className="btn btn-primary">Iniciar sesión</Link>
            <Link to="/register" className="btn btn-secondary">Registrarse</Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Características</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Juego en tiempo real</h3>
            <p>Juega con amigos con puntuación instantánea y rankings en vivo</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Fácil de unirse</h3>
            <p>Únete con códigos de 6 dígitos o explora partidas públicas</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Competitivo</h3>
            <p>Sigue tus estadísticas, sube en el ranking y sé el campeón de BrainBlitz</p>
          </div>
        </div>
      </div>
    </div>
  );
}
