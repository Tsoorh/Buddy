import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/AuthService';
import type { AxiosError } from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);
      const data = await AuthService.loginApi(formData);
      
      // Get user info
      AuthService.setToken(data.access_token);
      const userInfo = await AuthService.getUserInfoApi();
      
      login(data.access_token, data.refresh_token, userInfo);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail: string }>;
      const errorMsg = axiosError.response?.data?.detail || "Invalid credentials. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>SpearFreshFish</h2>
        <p style={styles.subtitle}>Login to your account</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" name="email" required style={styles.input} value={formData.email} onChange={handleChange} />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" required style={styles.input} value={formData.password} onChange={handleChange} />
          </div>
          
          <div style={styles.forgotPassword}>
             <Link to="/forgot-password" style={styles.link}>Forgot Password?</Link>
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B2D72',
    color: '#F6E7BC',
    fontFamily: 'Roboto, sans-serif',
    padding: '2rem 1rem'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '3rem 2rem',
    width: '100%',
    maxWidth: '450px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '2.2rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
    color: '#0AC4E0'
  },
  subtitle: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
    color: '#0992C2'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.2rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    marginBottom: '0.5rem',
    fontWeight: 500,
    fontSize: '0.95rem'
  },
  input: {
    padding: '0.85rem',
    borderRadius: '8px',
    border: '1px solid #0992C2',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    outline: 'none',
    fontSize: '1rem',
  },
  forgotPassword: {
    textAlign: 'right' as const,
    fontSize: '0.85rem',
    marginTop: '-0.5rem'
  },
  button: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#0AC4E0',
    color: '#0B2D72',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid red',
    color: '#ff6b6b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'center' as const
  },
  footerText: {
    marginTop: '2rem',
    textAlign: 'center' as const,
    fontSize: '0.95rem'
  },
  link: {
    color: '#0AC4E0',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default Login;
