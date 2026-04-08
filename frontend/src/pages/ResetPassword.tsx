import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import type { AxiosError } from 'axios';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token.");
    }
  }, [token]);

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) return;

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(formData.new_password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.resetPasswordApi({ token, new_password: formData.new_password });
      navigate('/login');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail: string }>;
      const errorMsg = axiosError.response?.data?.detail || "Failed to reset password. The token may have expired.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Enter your new password below.</p>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input 
              type="password" 
              name="new_password" 
              required 
              style={styles.input} 
              value={formData.new_password} 
              onChange={handleChange} 
              disabled={!token}
            />
            <small style={styles.hint}>Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</small>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input 
              type="password" 
              name="confirm_password" 
              required 
              style={styles.input} 
              value={formData.confirm_password} 
              onChange={handleChange} 
              disabled={!token}
            />
          </div>

          <button type="submit" style={styles.button} disabled={isLoading || !token}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
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
    fontSize: '2rem',
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
  hint: {
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    color: '#0992C2'
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
  }
};

export default ResetPassword;
