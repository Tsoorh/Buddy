import React from 'react';
import { Fish } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="glass-card m-2 border-0 mt-auto" style={{ padding: '2rem 1rem' }}>
      <div className="container text-center">
        <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
          <Fish size={24} color="#0AC4E0" />
          <span className="h5 mb-0 fw-bold" style={{ color: '#F6E7BC' }}>SpearFreshFish</span>
        </div>
        <p className="text-sand small mb-0 opacity-75">
          © {new Date().getFullYear()} SpearFreshFish - The Ultimate Fishing Companion. Built with love for the water.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
