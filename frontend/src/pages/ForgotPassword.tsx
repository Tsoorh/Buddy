import React, { useState } from 'react';
import { AuthService } from '../services/AuthService';
import { AuthLayout, AuthInput } from '../cmps/AuthShared';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      setIsLoading(true);
      await AuthService.forgotPasswordApi(email);
      setMessage("If an account with that email exists, a password reset email has been sent.");
    } catch {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Forgot Password" 
      subtitle="Enter your email to receive reset instructions."
      error={error}
      footerLinkText="Back to Login"
      footerLinkPath="/login"
    >
      {message && <div className="alert alert-success border-0 glass-card text-accent mb-4 py-3 text-center">{message}</div>}
      
      <form onSubmit={onHandleSubmit} className="auth-form">
        <AuthInput 
          label="Email" 
          type="email" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />

        <button type="submit" className="btn btn-accent p-3 w-100 mt-2" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
