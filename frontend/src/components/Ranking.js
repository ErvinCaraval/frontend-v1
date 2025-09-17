import React from 'react';
import './Ranking.css';

export default function Ranking({ players }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankClass = (index) => {
    switch (index) {
      case 0: return 'first';
      case 1: return 'second';
      case 2: return 'third';
      default: return '';
    }
  };

  return (
    <div className="ranking">
      <h3 className="ranking-title">🏆 Leaderboard</h3>
      <div className="players-list">
        {sortedPlayers.map((player, index) => (
          <div key={player.uid} className={`player-item ${getRankClass(index)}`}>
            <div className="player-rank">
              <span className="rank-icon">{getRankIcon(index)}</span>
            </div>
            <div className="player-info">
              <span className="player-name">
                {player.displayName || player.email}
              </span>
              <span className="player-score">{player.score} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
