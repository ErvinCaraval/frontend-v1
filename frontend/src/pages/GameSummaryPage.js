import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Ranking from '../components/Ranking';

export default function GameSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const players = location.state?.players || [];

  return (
    <div>
      <h2>Game Summary</h2>
      <Ranking players={players} />
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
}
