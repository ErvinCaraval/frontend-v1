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
  const [selectedTopic, setSelectedTopic] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

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

  const handleCreateGame = async () => {
    if (!selectedTopic) {
      alert('Por favor selecciona un tema antes de crear la partida.');
      return;
    }
    if (!generatedQuestions.length) {
      alert('Primero debes generar preguntas con IA antes de crear la partida.');
      return;
    }
    setLoading(true);
    socket.connect();
    // Obtener el token de autenticación del usuario
    let token = null;
    if (user && user.getIdToken) {
      token = await user.getIdToken();
    }
    socket.emit('createGame', {
      hostId: user.uid,
      displayName: user.displayName || user.email,
      isPublic: true,
      token,
      topic: selectedTopic,
      questions: generatedQuestions,
      count: generatedQuestions.length
    });
    socket.on('gameCreated', ({ gameId, questions }) => {
      setLoading(false);
      alert(`¡Partida creada con ${questions?.length || 0} preguntas!`);
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
    setGeneratedQuestions(questions);
    // Bloquear el cambio de tema y usar el último tema generado
    if (questions && questions.length > 0 && questions[0].category) {
      setSelectedTopic(questions[0].category);
    }
    // Opcional: podrías mostrar el tema generado en la UI para confirmación
    alert(`¡Se generaron ${questions.length} preguntas! Tema seleccionado: ${questions[0]?.category || ''}`);
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
                title="Primero genera preguntas con IA para que tu partida tenga contenido."
              >
                {loading ? 'Creando...' : 'Crear partida'}
              </button>
              <button 
                onClick={() => setShowAIGenerator(true)} 
                className="btn btn-ai btn-large"
                title="Genera preguntas personalizadas con IA antes de crear tu partida."
              >
                🤖 Generar preguntas con IA
              </button>
              <div style={{marginTop: 8, color: '#555', fontSize: 14}}>
                <strong>Ayuda:</strong> Antes de crear una partida, genera tus propias preguntas con IA. Así tu juego tendrá contenido personalizado y reciente.
              </div>
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
          onQuestionsGenerated={qs => {
            handleQuestionsGenerated(qs);
            setShowAIGenerator(false);
          }}
          onClose={() => setShowAIGenerator(false)}
        />
      )}
    </div>
  );
}
