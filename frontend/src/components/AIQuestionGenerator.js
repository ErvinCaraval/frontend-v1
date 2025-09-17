import React, { useState, useEffect } from 'react';
import './AIQuestionGenerator.css';

const AIQuestionGenerator = ({ onQuestionsGenerated, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTopics();
    fetchDifficultyLevels();
  }, []);

  const fetchTopics = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/ai/topics`);
      const data = await response.json();
      if (data.success) {
        setTopics(data.topics);
        setSelectedTopic(data.topics[0]);
      }
    } catch (error) {
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
      setError('Por favor selecciona un tema');
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
      
      if (data.success) {
        onQuestionsGenerated(data.questions);
        onClose();
      } else {
        setError(data.error || 'Error generando preguntas');
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
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
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
              disabled={loading}
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

