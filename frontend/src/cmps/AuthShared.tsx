import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkPath?: string;
  error?: string | null;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, title, subtitle, footerText, footerLinkText, footerLinkPath, error 
}) => {
  return (
    <div className="auth-container">
      <div className="auth-card glass-card shadow-lg">
        <h2 className="auth-title">{title}</h2>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        
        {error && <div className="alert alert-danger border-0 glass-card text-white mb-4 py-3 text-center">{error}</div>}
        
        {children}
        
        {(footerText || footerLinkText) && (
          <p className="auth-footer-text">
            {footerText} {footerLinkPath && <Link to={footerLinkPath} className="auth-link">{footerLinkText}</Link>}
          </p>
        )}
      </div>
    </div>
  );
};

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({ label, hint, ...props }) => (
  <div className="auth-input-group">
    <label className="auth-label">{label}</label>
    <input className="auth-input" {...props} />
    {hint && <small className="auth-hint">{hint}</small>}
  </div>
);
