import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import type { AxiosError } from 'axios';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    user_name: '',
    email: '',
    birthday: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      const dataToSubmit = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        user_name: formData.user_name,
        email: formData.email,
        birthday: formData.birthday,
        phone_number: formData.phone_number,
        password: formData.password
      };
      
      await AuthService.registerApi(dataToSubmit);
      navigate('/login');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail: string }>;
      const errorMsg = axiosError.response?.data?.detail || "Failed to register. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Join SpearFreshFish</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>First Name</label>
              <input type="text" name="first_name" required style={styles.input} value={formData.first_name} onChange={handleChange} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Last Name</label>
              <input type="text" name="last_name" required style={styles.input} value={formData.last_name} onChange={handleChange} />
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input type="text" name="user_name" required style={styles.input} value={formData.user_name} onChange={handleChange} />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input type="email" name="email" required style={styles.input} value={formData.email} onChange={handleChange} />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Birthday</label>
              <input type="date" name="birthday" required style={styles.input} value={formData.birthday} onChange={handleChange} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <input type="tel" name="phone_number" required style={styles.input} value={formData.phone_number} onChange={handleChange} />
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" required style={styles.input} value={formData.password} onChange={handleChange} />
            <small style={styles.hint}>Min 8 chars, 1 uppercase, 1 lowercase, 1 number.</small>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input type="password" name="confirm_password" required style={styles.input} value={formData.confirm_password} onChange={handleChange} />
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
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
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
    color: '#0AC4E0'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  row: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    minWidth: '200px'
  },
  label: {
    marginBottom: '0.5rem',
    fontWeight: 500,
    fontSize: '0.9rem'
  },
  input: {
    padding: '0.75rem',
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
    marginBottom: '1rem',
    textAlign: 'center' as const
  },
  footerText: {
    marginTop: '1.5rem',
    textAlign: 'center' as const,
    fontSize: '0.9rem'
  },
  link: {
    color: '#0AC4E0',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};

export default Register;
