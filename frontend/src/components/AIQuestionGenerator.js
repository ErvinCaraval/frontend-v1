import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import './AIQuestionGenerator.css';

const AIQuestionGenerator = ({ onQuestionsGenerated, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [canCreateGame, setCanCreateGame] = useState(false);

  useEffect(() => {
    fetchTopics();
    fetchDifficultyLevels();
  }, []);

  const fetchTopics = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/ai/topics`);
      const data = await response.json();
      if (data.success && Array.isArray(data.topics) && data.topics.length > 0) {
        setTopics(data.topics);
        setSelectedTopic(data.topics[0]);
      } else {
        setTopics([]);
        setSelectedTopic('');
        setError('No hay temas disponibles. Contacta al administrador.');
      }
    } catch (error) {
      setTopics([]);
      setSelectedTopic('');
      setError('Error obteniendo temas. Verifica tu conexión.');
      console.error('Error fetching topics:', error);
    }
  };

  const fetchDifficultyLevels = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/ai/difficulty-levels`);
      const data = await response.json();
      if (data.success) {
        setDifficultyLevels(data.levels);
      }
    } catch (error) {
      console.error('Error fetching difficulty levels:', error);
    }
  };

  const generateQuestions = async () => {
    if (!selectedTopic) {
      setError('Por favor selecciona un tema válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/ai/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          count: questionCount,
          useAI: useAI
        }),
      });

      const data = await response.json();
      console.log('Respuesta de /api/ai/generate-questions:', data);
      if (data.success) {
        // Guardar preguntas en Firestore y esperar confirmación exitosa antes de crear la partida
        const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const questionsWithMeta = data.questions.map(q => ({
          ...q,
          createdBy: user?.uid || 'anon',
          createdAt: Date.now(),
          category: selectedTopic,
          difficulty: selectedDifficulty
        }));
        let saveOk = false;
        try {
          const response = await fetch(`${apiBase}/api/questions/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: questionsWithMeta })
          });
          const result = await response.json();
          if (!result.success) {
            setError((prev) => (prev ? prev + ' | ' : '') + (result.error || 'Error guardando preguntas en Firestore'));
            console.error('Error guardando preguntas en Firestore:', result.error);
          } else {
            saveOk = true;
          }
        } catch (e) {
          setError((prev) => (prev ? prev + ' | ' : '') + 'Error guardando preguntas en Firestore');
          console.error('Error guardando preguntas en Firestore:', e);
        }
        if (!saveOk) {
          setLoading(false);
          return;
        }
        // Redirigir al usuario a la pantalla principal para que pueda crear la partida manualmente
        onQuestionsGenerated(data.questions);
        setLoading(false);
        navigate('/dashboard');
        onClose && onClose();
      } else {
        setError(data.error || 'Error generando preguntas');
        console.error('Error generando preguntas:', data.error);
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-generator-overlay">
      <div className="ai-generator-modal">
        <div className="ai-generator-header">
          <h2>🤖 Generador de Preguntas con IA</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="ai-generator-content">
          <div className="form-group">
            <label>Tema:</label>
            <select 
              value={selectedTopic} 
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="form-select"
              disabled={topics.length === 0}
            >
              {topics.length === 0 ? (
                <option value="">No hay temas disponibles</option>
              ) : (
                topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Dificultad:</label>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="form-select"
            >
              {difficultyLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Cantidad de preguntas:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              <span>Usar IA avanzada (requiere API key)</span>
            </label>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="ai-generator-actions">
            <button 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-primary" 
              onClick={generateQuestions}
              disabled={loading || topics.length === 0}
            >
              {loading ? 'Generando...' : 'Generar Preguntas'}
            </button>
          </div>
        </div>

        <div className="ai-generator-info">
          <p>💡 <strong>Tip:</strong> Las preguntas se generan automáticamente basadas en el tema seleccionado.</p>
          <p>🎯 <strong>Dificultad:</strong> Fácil, Medio, Difícil</p>
          <p>📚 <strong>Temas disponibles:</strong> {topics.length} temas diferentes</p>
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;

