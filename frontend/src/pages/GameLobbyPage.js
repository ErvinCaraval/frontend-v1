import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { socket } from '../services/socket';
import './GameLobbyPage.css';

export default function GameLobbyPage() {
  const { gameId } = useParams();
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [status, setStatus] = useState('waiting');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    socket.connect();
    socket.emit('joinGame', { 
      gameId, 
      uid: user.uid, 
      displayName: user.displayName || user.email 
    });
    
    socket.on('playerJoined', ({ players }) => {
      setPlayers(players);
      if (players.length > 0) setHostId(players[0].uid);
    });
    
    socket.on('gameStarted', () => {
      console.log('[GameLobbyPage] Evento gameStarted recibido, navegando a /game/' + gameId);
      navigate(`/game/${gameId}`);
    });
    
    socket.on('error', ({ error }) => {
      setError(error);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('error');
      socket.disconnect();
    };
  }, [gameId, user, navigate]);

  const handleStart = () => {
  console.log('[GameLobbyPage] Emitiendo startGame:', { gameId });
  socket.emit('startGame', { gameId });
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameId);
    alert('Game code copied to clipboard!');
  };

  if (error) {
    return (
      <div className="lobby-page error-page">
        <div className="error-container">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-page">
      <div className="lobby-container">
        <header className="lobby-header">
          <h1>🎮 Game Lobby</h1>
          <div className="game-code-section">
            <h3>Game Code</h3>
            <div className="game-code-display">
              <span className="game-code">{gameId}</span>
              <button onClick={copyGameCode} className="copy-btn">
                📋 Copy
              </button>
            </div>
            <p className="share-text">Share this code with friends to join your game!</p>
          </div>
        </header>

        <main className="lobby-main">
          <div className="players-section">
            <h3>👥 Players ({players.length})</h3>
            <div className="players-list">
              {players.map((player, index) => (
                <div key={player.uid} className={`player-card ${player.uid === hostId ? 'host' : ''}`}>
                  <div className="player-avatar">
                    {player.uid === hostId ? '👑' : '👤'}
                  </div>
                  <div className="player-info">
                    <span className="player-name">
                      {player.displayName || player.email}
                    </span>
                    {player.uid === hostId && (
                      <span className="host-badge">Host</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="game-controls">
            {user && user.uid === hostId && status === 'waiting' ? (
              <div className="host-controls">
                <p>Ready to start the game?</p>
                <button 
                  onClick={handleStart} 
                  className="btn btn-primary btn-large"
                  disabled={players.length < 1}
                >
                  🚀 Start Game
                </button>
                {players.length < 1 && (
                  <p className="waiting-text">Waiting for players to join...</p>
                )}
              </div>
            ) : (
              <div className="waiting-controls">
                <p>⏳ Waiting for the host to start the game...</p>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
