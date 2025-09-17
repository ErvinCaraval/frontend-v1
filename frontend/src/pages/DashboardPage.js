import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket';
import AIQuestionGenerator from '../components/AIQuestionGenerator';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [gameCode, setGameCode] = useState('');
  const [publicGames, setPublicGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    fetchPublicGames();
  }, []);

  const fetchPublicGames = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/games`);
      const data = await response.json();
      const gamesArray = Array.isArray(data) ? data : [];
      setPublicGames(gamesArray);
    } catch (error) {
      console.error('Error fetching games:', error);
      setPublicGames([]);
    }
  };

  const handleCreateGame = () => {
    setLoading(true);
    socket.connect();
    socket.emit('createGame', {
      hostId: user.uid,
      displayName: user.displayName || user.email,
      isPublic: true
    });
    
    socket.on('gameCreated', ({ gameId }) => {
      setLoading(false);
      navigate(`/lobby/${gameId}`);
    });
    
    socket.on('error', ({ error }) => {
      setLoading(false);
      alert('Error creating game: ' + error);
    });
  };

  const handleJoinGame = () => {
    if (!gameCode.trim()) {
      alert('Please enter a game code');
      return;
    }
    navigate(`/lobby/${gameCode}`);
  };

  const handleJoinPublicGame = (gameId) => {
    navigate(`/lobby/${gameId}`);
  };

  const handleQuestionsGenerated = (questions) => {
    console.log('Preguntas generadas:', questions);
    // Aquí podrías guardar las preguntas o usarlas para crear un juego
    alert(`¡Se generaron ${questions.length} preguntas!`);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="user-info">
          <h2>¡Bienvenido, {user?.displayName || user?.email}!</h2>
          <div className="user-actions">
            <button onClick={() => navigate('/profile')} className="btn btn-secondary">
              Perfil
            </button>
            <button onClick={logout} className="btn btn-outline">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="game-actions">
          <div className="create-game-section">
            <h3>🎮 Crear nueva partida</h3>
            <p>Inicia una partida y invita a tus amigos</p>
            <div className="create-game-actions">
              <button 
                onClick={handleCreateGame} 
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear partida'}
              </button>
              <button 
                onClick={() => setShowAIGenerator(true)} 
                className="btn btn-ai btn-large"
              >
                🤖 Generar preguntas con IA
              </button>
            </div>
          </div>

          <div className="join-game-section">
            <h3>🔗 Unirse a partida</h3>
            <p>Ingresa un código de 6 dígitos para unirte</p>
            <div className="join-form">
              <input
                type="text"
                placeholder="Ingresa el código de la partida"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                maxLength="6"
                className="game-code-input"
              />
              <button onClick={handleJoinGame} className="btn btn-secondary">
                Unirse
              </button>
            </div>
          </div>
        </div>

        <div className="public-games-section">
          <h3>🌐 Partidas públicas</h3>
          <p>Únete a partidas abiertas para todos</p>
          <div className="games-list">
            {!Array.isArray(publicGames) || publicGames.length === 0 ? (
              <p className="no-games">No hay partidas públicas disponibles por ahora</p>
            ) : (
              publicGames.map(game => (
                <div key={game.id} className="game-card">
                  <div className="game-info">
                    <h4>Partida #{game.id}</h4>
                    <p>Jugadores: {game.players?.length || 0}</p>
                    <p>Anfitrión: {game.players?.[0]?.displayName || 'Desconocido'}</p>
                  </div>
                  <button 
                    onClick={() => handleJoinPublicGame(game.id)}
                    className="btn btn-primary"
                  >
                    Unirse
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showAIGenerator && (
        <AIQuestionGenerator
          onQuestionsGenerated={handleQuestionsGenerated}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}
