import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PasswordResetPage from './pages/PasswordResetPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import GameLobbyPage from './pages/GameLobbyPage';
import GamePage from './pages/GamePage';
import GameSummaryPage from './pages/GameSummaryPage';
import AdminPage from './pages/AdminPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset" element={<PasswordResetPage />} />
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
  <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />
  <Route path="/lobby/:gameId" element={<ProtectedRoute><GameLobbyPage /></ProtectedRoute>} />
  <Route path="/game/:gameId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
  <Route path="/summary/:gameId" element={<ProtectedRoute><GameSummaryPage /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
