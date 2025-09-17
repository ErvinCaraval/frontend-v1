import React from 'react';

export default function Question({ question, options, onSelect, selected }) {
  return (
    <div>
      <h3>{question}</h3>
      <ul>
        {options.map((opt, idx) => (
          <li key={idx}>
            <button
              style={{ background: selected === idx ? '#bde0fe' : '' }}
              onClick={() => onSelect(idx)}
              disabled={selected !== null}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
