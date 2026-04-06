import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // Mock login
    login('fake-jwt-token', { id: '1', email: 'user@example.com', name: 'Fishing Buddy' });
    navigate('/dashboard');
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleLogin}>Login as Guest (Mock)</button>
    </div>
  );
};

export default Login;
