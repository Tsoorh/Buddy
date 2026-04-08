import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated || isGuest ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AuthOnlyRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};
