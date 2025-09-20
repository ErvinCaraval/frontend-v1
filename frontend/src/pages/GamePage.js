import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { socket } from '../services/socket';
import Question from '../components/Question';
import Timer from '../components/Timer';
import Ranking from '../components/Ranking';
import './GamePage.css';

export default function GamePage() {
  const [questionTimeout, setQuestionTimeout] = useState(false);
  const { gameId } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selected, setSelected] = useState(null);
  const [players, setPlayers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    // Solicitar la primera pregunta al conectar
    if (user && gameId) {
      socket.emit('requestQuestion', { gameId });
      console.log('[GamePage] Emitiendo requestQuestion:', { gameId });
    }
    // Si no llega pregunta en 5 segundos, mostrar error
    const timeout = setTimeout(() => {
      if (!question) setQuestionTimeout(true);
    }, 5000);

    if (!user) return;
    if (!socket.connected) {
      console.log('[GamePage] Intentando conectar socket...');
      socket.connect();
    }
    // Listeners nombrados para evitar duplicados
    function onConnect() {
      console.log('[GamePage] Socket conectado:', socket.id);
    }
    function onNewQuestion({ question, index }) {
      console.log('[GamePage] Evento newQuestion recibido:', question);
        // Asegurarse de que las opciones no se barajen ni modifiquen
        // y que el índice de la respuesta correcta corresponda al array recibido
        if (!Array.isArray(question.options)) {
          question.options = [];
        }
        setQuestion({
          ...question,
          options: [...question.options], // Copia directa, sin barajar
        });
        setQuestionIndex(index);
        setSelected(null);
        setShowResult(false);
        setTimeLeft(10);
        setTimerKey(prev => prev + 1);
    }
    function onAnswerResult({ correctAnswerIndex, explanation, players }) {
      console.log('[GamePage] Evento answerResult recibido:', { correctAnswerIndex, explanation, players });
      setShowResult(true);
      setResult({ correctAnswerIndex, explanation });
      setPlayers(players);
    }
    function onGameFinished({ players }) {
      console.log('[GamePage] Evento gameFinished recibido:', players);
      navigate(`/summary/${gameId}`, { state: { players } });
    }
    function onGameStarted({ questionsCount }) {
      console.log('[GamePage] Evento gameStarted recibido:', questionsCount);
      setTotalQuestions(questionsCount);
    }

    socket.on('connect', onConnect);
    socket.on('newQuestion', onNewQuestion);
    socket.on('answerResult', onAnswerResult);
    socket.on('gameFinished', onGameFinished);
    socket.on('gameStarted', onGameStarted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('newQuestion', onNewQuestion);
      socket.off('answerResult', onAnswerResult);
      socket.off('gameFinished', onGameFinished);
      socket.off('gameStarted', onGameStarted);
    };
  }, [user, gameId, navigate]);

  const handleSelect = useCallback((idx) => {
  if (selected !== null) return; // Prevent multiple selections
  setSelected(idx);
  // Enviar también el valor de la opción seleccionada
  const answerValue = question && Array.isArray(question.options) ? question.options[idx] : undefined;
  socket.emit('submitAnswer', { gameId, uid: user.uid, answerIndex: idx, answerValue });
  }, [gameId, user, selected]);

  const handleTimerEnd = useCallback(() => {
    if (selected === null) {
      socket.emit('submitAnswer', { gameId, uid: user.uid, answerIndex: null, answerValue: null });
    }
  }, [gameId, user, selected]);

  const getOptionColor = (index) => {
    if (!showResult) {
      return selected === index ? 'selected' : '';
    }
    
    if (index === result.correctAnswerIndex) {
      return 'correct';
    }
    
    if (selected === index && index !== result.correctAnswerIndex) {
      return 'incorrect';
    }
    
    return '';
  };

  const getPlayerRank = () => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const playerIndex = sortedPlayers.findIndex(p => p.uid === user.uid);
    return playerIndex + 1;
  };

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="game-info">
          <h2>🎯 Quiz Game</h2>
          <div className="progress-info">
            <span className="question-counter">
              Question {questionIndex + 1} of {totalQuestions || '?'}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((questionIndex + 1) / (totalQuestions || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="player-rank">
          <span className="rank-number">#{getPlayerRank()}</span>
          <span className="rank-label">Your Rank</span>
        </div>
      </header>

      <main className="game-main">
        {question && (
          <div className="question-container">
            <div className="question-header">
              <Question
                question={question.question}
                options={question.options}
                onSelect={handleSelect}
                selected={selected}
              />
              {!showResult && (
                <Timer
                  key={timerKey}
                  seconds={10}
                  onEnd={handleTimerEnd}
                  onTick={setTimeLeft}
                />
              )}
            </div>
            {showResult && result && (
              <div className="result-container">
                <div className="result-header">
                  <h4>✅ Answer Revealed!</h4>
                </div>
                <div className="correct-answer">
                  <strong>Correct Answer:</strong> {question.options[result.correctAnswerIndex]}
                </div>
                {result.explanation && (
                  <div className="explanation">
                    <strong>Explanation:</strong> {result.explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!question && !questionTimeout && (
          <div className="waiting-container">
            <div className="loading-spinner"></div>
            <p>Waiting for next question...</p>
          </div>
        )}
        {!question && questionTimeout && (
          <div className="waiting-container">
            <div className="loading-spinner"></div>
            <p style={{color: 'red', fontWeight: 'bold'}}>No se encontraron preguntas para este tema. Verifica que hayas generado preguntas y que el tema coincida exactamente.</p>
          </div>
        )}
      </main>

      <aside className="game-sidebar">
        <Ranking players={players} />
      </aside>
    </div>
  );
}
