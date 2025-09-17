import React, { useEffect, useState } from 'react';
import './Timer.css';

export default function Timer({ seconds, onEnd, onTick }) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    if (time === 0) {
      onEnd();
      return;
    }
    const interval = setInterval(() => {
      setTime(t => {
        const newTime = t - 1;
        if (onTick) onTick(newTime);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [time, onEnd, onTick]);

  const getTimerColor = () => {
    if (time <= 3) return 'critical';
    if (time <= 6) return 'warning';
    return 'normal';
  };

  return (
    <div className={`timer ${getTimerColor()}`}>
      <div className="timer-circle">
        <span className="timer-text">{time}</span>
      </div>
      <span className="timer-label">seconds left</span>
    </div>
  );
}
