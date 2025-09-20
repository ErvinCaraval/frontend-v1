
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import ManualQuestionForm from './ManualQuestionForm';
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
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualCount, setManualCount] = useState(1);
  const [manualStep, setManualStep] = useState(0);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [manualTopic, setManualTopic] = useState('');
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
      const token = user && user.getIdToken ? await user.getIdToken() : null;
      const response = await fetch(`${apiBase}/api/ai/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
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
        const questionsWithMeta = data.questions.map(q => ({
          // Si las opciones existen, barajarlas y actualizar el índice de la respuesta correcta de forma robusta
          ...(() => {
            if (!Array.isArray(q.options) || typeof q.correctAnswerIndex !== 'number') return q;
            // Asociar cada opción con su índice original
            const optionsWithIndex = q.options.map((opt, idx) => ({ opt, origIdx: idx }));
            // Barajar
            for (let i = optionsWithIndex.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
            }
            // Buscar la nueva posición de la opción que era la correcta
            const newCorrectIndex = optionsWithIndex.findIndex(o => o.origIdx === q.correctAnswerIndex);
            return {
              ...q,
              options: optionsWithIndex.map(o => o.opt),
              correctAnswerIndex: newCorrectIndex
            };
          })(),
          createdBy: user?.uid || 'anon',
          createdAt: Date.now(),
          category: selectedTopic,
          difficulty: selectedDifficulty
        }));
        let saveOk = false;
        try {
          const bulkToken = user && user.getIdToken ? await user.getIdToken() : null;
          const response = await fetch(`${apiBase}/api/questions/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(bulkToken ? { Authorization: `Bearer ${bulkToken}` } : {})
            },
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
  // No navegues ni cierres aquí, deja que el Dashboard controle el cierre
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

  // Reinicia el contador de preguntas al cerrar el generador para evitar confusión
  useEffect(() => {
    if (!loading && !error && generatedQuestions.length === 0) {
      setQuestionCount(5);
    }
  }, [loading, error, generatedQuestions]);

  return (
    <div className="ai-generator-overlay">
      <div className="ai-generator-modal">
        <div className="ai-generator-header">
          <h2>🤖 Generador de Preguntas</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        {showManualForm ? (
          <div>
            {manualStep === 0 ? (
              <form onSubmit={e => { e.preventDefault(); setManualStep(1); setManualQuestions([]); setManualTopic(selectedTopic); }} style={{ marginBottom: 24 }}>
                <h3>¿Cuántas preguntas manuales quieres crear?</h3>
                <label>
                  Tema:
                  <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                <label style={{ marginLeft: 16 }}>
                  Número:
                  <input type="number" min={1} max={50} value={manualCount} onChange={e => setManualCount(Number(e.target.value))} style={{ width: 60, marginLeft: 8 }} />
                </label>
                <button type="submit" className="btn btn-primary" style={{ marginLeft: 16 }}>Comenzar</button>
                <button type="button" className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => setShowManualForm(false)}>Cancelar</button>
              </form>
            ) : (
              <ManualQuestionForm
                topics={[manualTopic]}
                onQuestionCreated={q => {
                  const next = manualQuestions.concat([{ ...q, category: manualTopic }]);
                  if (next.length < manualCount) {
                    setManualQuestions(next);
                    setManualStep(manualStep + 1);
                  } else {
                    // Guardar todas las preguntas en lote
                    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
                    user.getIdToken().then(token => {
                      fetch(`${apiBase}/api/questions/bulk`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ questions: next })
                      })
                        .then(res => res.json())
                        .then(data => {
                          setShowManualForm(false);
                          setError('');
                          setGeneratedQuestions(gqs => [...gqs, ...next]);
                          onQuestionsGenerated && onQuestionsGenerated(next);
                        })
                        .catch(() => {
                          setError('Error guardando preguntas en Firestore');
                          setShowManualForm(false);
                        });
                    });
                  }
                }}
                onCancel={() => setShowManualForm(false)}
              />
            )}
            {manualStep > 0 && manualStep <= manualCount && (
              <div style={{ marginTop: 12, fontWeight: 'bold' }}>Pregunta {manualQuestions.length + 1} de {manualCount}</div>
            )}
          </div>
        ) : (
          <>
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
                  max="50"
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
                  {loading ? 'Generando...' : 'Generar Preguntas IA'}
                </button>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => setShowManualForm(true)}
                  disabled={loading || topics.length === 0}
                  style={{ marginLeft: 8 }}
                >
                  Escribir pregunta manual
                </button>
              </div>
            </div>
            <div className="ai-generator-info">
              <p>💡 <strong>Tip:</strong> Puedes generar preguntas con IA o escribirlas manualmente.</p>
              <p>🎯 <strong>Dificultad:</strong> Fácil, Medio, Difícil</p>
              <p>📚 <strong>Temas disponibles:</strong> {topics.length} temas diferentes</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AIQuestionGenerator;

