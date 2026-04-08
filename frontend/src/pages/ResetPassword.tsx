import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import type { AxiosError } from 'axios';
import { AuthLayout, AuthInput } from '../cmps/AuthShared';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ new_password: '', confirm_password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) return;
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.resetPasswordApi({ token, new_password: formData.new_password });
      navigate('/login');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(axiosError.response?.data?.detail || "Failed to reset password. The token may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below." error={error}>
      <form onSubmit={onHandleSubmit} className="auth-form">
        <AuthInput 
          label="New Password" type="password" name="new_password" required 
          value={formData.new_password} onChange={onHandleChange} disabled={!token}
          hint="Min 8 chars, 1 uppercase, 1 lowercase, 1 number."
        />
        
        <AuthInput 
          label="Confirm Password" type="password" name="confirm_password" required 
          value={formData.confirm_password} onChange={onHandleChange} disabled={!token}
        />

        <button type="submit" className="btn btn-accent p-3 w-100 mt-2" disabled={isLoading || !token}>
          {isLoading ? 'Resetting...' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
