import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import type { AxiosError } from 'axios';
import { AuthLayout, AuthInput } from '../cmps/AuthShared';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', user_name: '', email: '', birthday: '', phone_number: '', password: '', confirm_password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onHandleSubmit = async (e: React.FormEvent) => {
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
      await AuthService.registerApi({ ...formData });
      navigate('/login');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(axiosError.response?.data?.detail || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Join SpearFreshFish" 
      error={error}
      footerText="Already have an account?"
      footerLinkText="Login here"
      footerLinkPath="/login"
    >
      <form onSubmit={onHandleSubmit} className="auth-form">
        <div className="d-flex gap-3 flex-wrap flex-md-nowrap">
          <AuthInput label="First Name" name="first_name" required value={formData.first_name} onChange={onHandleChange} />
          <AuthInput label="Last Name" name="last_name" required value={formData.last_name} onChange={onHandleChange} />
        </div>
        
        <AuthInput label="Username" name="user_name" required value={formData.user_name} onChange={onHandleChange} />
        <AuthInput label="Email" type="email" name="email" required value={formData.email} onChange={onHandleChange} />

        <div className="d-flex gap-3 flex-wrap flex-md-nowrap">
          <AuthInput label="Birthday" type="date" name="birthday" required value={formData.birthday} onChange={onHandleChange} />
          <AuthInput label="Phone Number" type="tel" name="phone_number" required value={formData.phone_number} onChange={onHandleChange} />
        </div>
        
        <AuthInput 
          label="Password" type="password" name="password" required value={formData.password} onChange={onHandleChange}
          hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number."
        />
        
        <AuthInput label="Confirm Password" type="password" name="confirm_password" required value={formData.confirm_password} onChange={onHandleChange} />

        <button type="submit" className="btn btn-accent p-3 w-100 mt-2" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
