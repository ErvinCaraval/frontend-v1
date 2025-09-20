import React, { useEffect, useState, useRef } from 'react';
import './Timer.css';

export default function Timer({ seconds = 20, onEnd, onTick }) {
  const [time, setTime] = useState(seconds);
  const intervalRef = useRef();

  useEffect(() => {
    setTime(seconds);
  }, [seconds]);

  useEffect(() => {
    if (time === 0) {
      if (onEnd) onEnd();
      return;
    }
    intervalRef.current = setInterval(() => {
      setTime(t => t - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [time, onEnd]);

  useEffect(() => {
    if (onTick) onTick(time);
  }, [time, onTick]);

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
      <span className="timer-label">segundos restantes</span>
    </div>
  );
}
