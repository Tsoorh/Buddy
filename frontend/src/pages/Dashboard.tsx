import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { CloudRain, Wind, Thermometer, Waves, BrainCircuit, PlusCircle, Trophy, History, MapPin } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [weather] = useState({ temp: 24, waterTemp: 18, wind: 12, tide: 'High' });
  const [insight] = useState('High pressure detected. Try deep-water lures near the reef.');

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: '#F6E7BC' }}>Good Morning, {user?.name || 'SpearFreshFish'}!</h2>
          <p className="opacity-75 mb-0">It's a great day for Bass fishing.</p>
        </div>
        <Link to="/log-catch" className="btn btn-accent btn-lg d-flex align-items-center gap-2">
          <PlusCircle size={20} />
          <span>Log New Catch</span>
        </Link>
      </div>

      <div className="row g-4 mb-4">
        {/* Weather & Tide Widget */}
        <div className="col-lg-8">
          <div className="glass-card h-100">
            <h5 className="mb-4 d-flex align-items-center gap-2">
              <CloudRain size={20} color="#0AC4E0" />
              Conditions at Eilat, Israel
            </h5>
            <div className="row text-center">
              <div className="col-3">
                <Thermometer size={32} className="mb-2 opacity-75" />
                <div className="h4 mb-0">{weather.temp}°C</div>
                <div className="small opacity-50">Air</div>
              </div>
              <div className="col-3">
                <Waves size={32} className="mb-2 opacity-75" />
                <div className="h4 mb-0">{weather.waterTemp}°C</div>
                <div className="small opacity-50">Water</div>
              </div>
              <div className="col-3">
                <Wind size={32} className="mb-2 opacity-75" />
                <div className="h4 mb-0">{weather.wind} km/h</div>
                <div className="small opacity-50">Wind</div>
              </div>
              <div className="col-3">
                <History size={32} className="mb-2 opacity-75" />
                <div className="h4 mb-0">{weather.tide}</div>
                <div className="small opacity-50">Tide</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="col-lg-4">
          <div className="glass-card h-100 border-0" style={{ background: 'linear-gradient(135deg, rgba(10, 196, 224, 0.2), rgba(11, 45, 114, 0.4))' }}>
            <h5 className="mb-3 d-flex align-items-center gap-2" style={{ color: '#0AC4E0' }}>
              <BrainCircuit size={20} />
              AI Pro Tip
            </h5>
            <p className="mb-0 fs-5" style={{ color: '#F6E7BC', fontStyle: 'italic' }}>
              "{insight}"
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="glass-card text-center py-4">
            <h6 className="opacity-50 text-uppercase mb-2 small">Total Catches</h6>
            <div className="display-6 fw-bold">142</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center py-4">
            <h6 className="opacity-50 text-uppercase mb-2 small">Total Sessions</h6>
            <div className="display-6 fw-bold">48</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center py-4">
             <Trophy size={20} color="#0AC4E0" className="mb-2" />
            <h6 className="opacity-50 text-uppercase mb-2 small">Biggest Fish</h6>
            <div className="display-6 fw-bold">5.4 kg</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center py-4">
            <h6 className="opacity-50 text-uppercase mb-2 small">Hours Logged</h6>
            <div className="display-6 fw-bold">214h</div>
          </div>
        </div>
      </div>

      {/* Latest Catches Section */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Recent Catches</h4>
          <Link to="/catches" className="text-accent text-decoration-none small">View All</Link>
        </div>
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => (
            <div className="col-md-3" key={i}>
              <div className="glass-card p-0 overflow-hidden">
                <div style={{ height: '160px', backgroundColor: '#0992C2', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                    <Waves size={48} className="mx-auto opacity-25" />
                </div>
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="mb-0">Grouper (Bass)</h6>
                    <span className="badge bg-secondary">2.4 kg</span>
                  </div>
                  <div className="small d-flex align-items-center gap-1 opacity-50 mb-2">
                    <MapPin size={12} />
                    North Beach, Eilat
                  </div>
                  <div className="small opacity-50">Apr 05, 2026</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
