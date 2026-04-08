import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Dashboard from '../pages/Dashboard';
import CatchLogger from '../pages/CatchLogger';
import SessionLogger from '../pages/SessionLogger';
import Catches from '../pages/Catches';
import Sessions from '../pages/Sessions';
import { ProtectedRoute, AuthOnlyRoute, PublicRoute } from './Guards';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* Public/Guest routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected routes (Accessible by User or Guest) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/catches" element={<Catches />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/log-session" element={<SessionLogger />} />
      </Route>
      
      {/* Auth-only routes (No Guests allowed) */}
      <Route element={<AuthOnlyRoute />}>
        <Route path="/log-catch" element={<CatchLogger />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
