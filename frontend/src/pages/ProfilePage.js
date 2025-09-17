import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import mockDb from '../services/mockDb';

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      const docRef = mockDb.collection('users').doc(user.uid);
      const docSnap = await docRef.get();
      if (docSnap.exists) setStats(docSnap.data().stats);
      setLoading(false);
    }
    fetchStats();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <h2>Profile</h2>
      {stats ? (
        <ul>
          <li>Games Played: {stats.gamesPlayed}</li>
          <li>Wins: {stats.wins}</li>
          <li>Correct Answers: {stats.correctAnswers}</li>
        </ul>
      ) : (
        <p>No stats found.</p>
      )}
    </div>
  );
}
