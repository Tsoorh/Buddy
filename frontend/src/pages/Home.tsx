import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, BarChart3, BrainCircuit, Waves } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <section className="row align-items-center mb-5 min-vh-75">
        <div className="col-lg-6 mb-4 mb-lg-0 text-center text-lg-start">
          <h1 className="display-3 mb-3" style={{ color: '#F6E7BC' }}>
            The Ultimate <br /> <span style={{ color: '#0AC4E0' }}>Fishing Companion</span>
          </h1>
          <p className="lead mb-4 opacity-75">
            Track your catches, analyze environmental data, and unlock AI-powered insights to catch more fish.
          </p>
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
            <Link to={user ? "/dashboard" : "/login"} className="btn btn-accent btn-lg px-5 py-3 shadow">
              {user ? "Go to Dashboard" : "Get Started Now"}
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-outline-light btn-lg px-5 py-3">
                Create Account
              </Link>
            )}
          </div>
        </div>
        <div className="col-lg-6 d-none d-lg-block text-center">
           <Waves size={300} color="#0AC4E0" className="opacity-25" />
        </div>
      </section>

      {/* Features Section */}
      <section className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="glass-card h-100 text-center">
            <Anchor size={48} className="mb-3" color="#0AC4E0" />
            <h3>Track Sessions</h3>
            <p className="opacity-75">Log your fishing trips with GPS locations, depth, and visibility data.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card h-100 text-center">
            <BarChart3 size={48} className="mb-3" color="#0AC4E0" />
            <h3>Analyze Catches</h3>
            <p className="opacity-75">Record every catch with photos, weight, and species information.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="glass-card h-100 text-center">
            <BrainCircuit size={48} className="mb-3" color="#0AC4E0" />
            <h3>AI Insights</h3>
            <p className="opacity-75">Our AI analyzes weather and tides to give you the best chance of success.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-card text-center py-5 border-0" style={{ background: 'linear-gradient(135deg, rgba(10, 196, 224, 0.1), rgba(11, 45, 114, 0.5))' }}>
        <h2 className="mb-3">Ready to cast your line?</h2>
        <p className="mb-4 opacity-75">Join thousands of fishers already using SpearFreshFish.</p>
        <Link to="/login" className="btn btn-accent px-5">Join the Community</Link>
      </section>
    </div>
  );
};

export default Home;
