import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Fish, Home, LayoutDashboard, MessageSquare } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed-top glass-card m-2 border-0" style={{ padding: '0.75rem 1.5rem', zIndex: 1030 }}>
      <nav className="container-fluid d-flex justify-content-between align-items-center">
        <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <Fish size={32} color="#0AC4E0" />
          <span className="h4 mb-0 fw-bold" style={{ color: '#F6E7BC' }}>SpearFreshFish</span>
        </Link>

        <div className="d-flex align-items-center gap-4">
          <Link to="/" className="nav-link d-flex align-items-center gap-1">
            <Home size={18} />
            <span className="d-none d-md-inline">Home</span>
          </Link>
          
          {user && (
            <>
              <Link to="/dashboard" className="nav-link d-flex align-items-center gap-1">
                <LayoutDashboard size={18} />
                <span className="d-none d-md-inline">Dashboard</span>
              </Link>
              <Link to="/chat" className="nav-link d-flex align-items-center gap-1">
                <MessageSquare size={18} />
                <span className="d-none d-md-inline">Chat</span>
              </Link>
            </>
          )}

          <div className="ms-3 d-flex align-items-center gap-3">
            {user ? (
              <>
                <span className="d-none d-lg-inline text-sand small">Hi, {user.name}</span>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 px-3">
                  <LogOut size={16} />
                  <span className="d-none d-sm-inline">Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-accent btn-sm px-4">Login</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
