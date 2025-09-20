import React from 'react';
import './AIQuestionGenerator.css';

export default function Question({ question, options, onSelect, selected }) {
  return (
    <div className="question-card">
      <h2 className="question-title">{question}</h2>
      <div className="options-list">
        {options.map((opt, idx) => (
          <button
            key={idx}
            className={`option-btn${selected === idx ? ' selected' : ''}`}
            onClick={() => onSelect(idx)}
            disabled={selected !== null}
          >
            <span className="option-label">{String.fromCharCode(65 + idx)})</span> {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
