import React, { useState } from 'react';

const ManualQuestionForm = ({ topics, onQuestionCreated, onCancel }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(topics[0] || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!question.trim() || options.some(opt => !opt.trim())) {
      setError('Completa la pregunta y todas las opciones.');
      return;
    }
    setLoading(true);
    try {
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = window?.authUser && window.authUser.getIdToken ? await window.authUser.getIdToken() : null;
      // Si el AuthContext está disponible, úsalo
      let finalToken = token;
      if (!finalToken && typeof window !== 'undefined') {
        try {
          const { user } = require('../AuthContext').useAuth();
          if (user && user.getIdToken) finalToken = await user.getIdToken();
        } catch {}
      }
      const payload = {
        text: question,
        options,
        correctAnswerIndex: correctIndex,
        category: selectedTopic,
        explanation: ''
      };
      const res = await fetch(`${apiBase}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(finalToken ? { Authorization: `Bearer ${finalToken}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        onQuestionCreated && onQuestionCreated(data.question || { question, options, correctAnswerIndex: correctIndex, category: selectedTopic });
      } else {
        setError(data.error || 'Error al guardar la pregunta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="manual-question-form" onSubmit={handleSubmit}>
      <h3>Agregar pregunta manual</h3>
      <label>
        Tema:
        <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
      <label>
        Pregunta:
        <input type="text" value={question} onChange={e => setQuestion(e.target.value)} required />
      </label>
      <div>
        Opciones:
        {options.map((opt, idx) => (
          <div key={idx}>
            <input
              type="text"
              value={opt}
              onChange={e => handleOptionChange(idx, e.target.value)}
              required
              placeholder={`Opción ${idx + 1}`}
            />
            <label>
              <input
                type="radio"
                name="correctOption"
                checked={correctIndex === idx}
                onChange={() => setCorrectIndex(idx)}
              />
              Correcta
            </label>
          </div>
        ))}
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="manual-question-actions">
        <button type="button" onClick={onCancel} disabled={loading}>Cancelar</button>
        <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar pregunta'}</button>
      </div>
    </form>
  );
};

export default ManualQuestionForm;
