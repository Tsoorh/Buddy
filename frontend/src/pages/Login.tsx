import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/AuthService';
import type { AxiosError } from 'axios';
import { AuthLayout, AuthInput } from '../cmps/AuthShared';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      const data = await AuthService.loginApi(formData);
      AuthService.setToken(data.access_token);
      const userInfo = await AuthService.getUserInfoApi();
      
      login(data.access_token, data.refresh_token, userInfo);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(axiosError.response?.data?.detail || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="SpearFreshFish" 
      subtitle="Login to your account"
      error={error}
      footerText="Don't have an account?"
      footerLinkText="Register here"
      footerLinkPath="/register"
    >
      <form onSubmit={onHandleSubmit} className="auth-form">
        <AuthInput 
          label="Email" 
          type="email" 
          name="email" 
          required 
          value={formData.email} 
          onChange={onHandleChange} 
        />
        
        <AuthInput 
          label="Password" 
          type="password" 
          name="password" 
          required 
          value={formData.password} 
          onChange={onHandleChange} 
        />
        
        <div className="text-end" style={{ marginTop: '-0.5rem' }}>
           <Link to="/forgot-password" size="sm" className="auth-link small">Forgot Password?</Link>
        </div>

        <button type="submit" className="btn btn-accent p-3 w-100 mt-2" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
