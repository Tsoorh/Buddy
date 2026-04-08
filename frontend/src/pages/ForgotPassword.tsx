import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthService } from '../services/AuthService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      setIsLoading(true);
      await AuthService.forgotPasswordApi(email);
      setMessage("If an account with that email exists, a password reset email has been sent.");
    } catch (err: any) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Forgot Password</h2>
        <p style={styles.subtitle}>Enter your email to receive reset instructions.</p>
        
        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              required 
              style={styles.input} 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <p style={styles.footerText}>
          Remember your password? <Link to="/login" style={styles.link}>Login here</Link>
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
  success: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    border: '1px solid #0AC4E0',
    color: '#0AC4E0',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    textAlign: 'center' as const
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

export default ForgotPassword;
