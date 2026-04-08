import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { CloudRain, Wind, Thermometer, Waves, BrainCircuit, PlusCircle, Trophy, History, MapPin, Loader2 } from 'lucide-react';
import { CatchService, type CatchResponse } from '../services/CatchService';
import { AnalyticsService, type AIInsightsResponse } from '../services/AnalyticsService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [weather] = useState({ temp: 24, waterTemp: 18, wind: 12, tide: 'High' });
  
  const [catches, setCatches] = useState<CatchResponse[]>([]);
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catchesData, insightsData] = await Promise.all([
          CatchService.getCatchesApi(),
          AnalyticsService.getInsightsApi()
        ]);
        setCatches(catchesData);
        setInsights(insightsData);
      } catch (err: unknown) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute dynamic stats
  const totalCatches = catches.length;
  const biggestFish = catches.length > 0 
    ? Math.max(...catches.map(c => c.weight || 0)) 
    : 0;
  
  // Sort and take top 4 most recent catches
  const recentCatches = [...catches]
    .sort((a, b) => {
        const dateA = a.catch_time ? new Date(a.catch_time).getTime() : 0;
        const dateB = b.catch_time ? new Date(b.catch_time).getTime() : 0;
        return dateB - dateA;
    })
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="container py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <Loader2 size={48} className="animate-spin mb-3" color="#0AC4E0" />
        <p className="text-sand opacity-75">Diving for your data...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: '#F6E7BC' }}>
            Good Morning, {user?.user_name || user?.first_name || 'SpearFreshFish'}!
          </h2>
          <p className="opacity-75 mb-0">It's a great day for Bass fishing.</p>
        </div>
        <Link to="/log-catch" className="btn btn-accent btn-lg d-flex align-items-center gap-2">
          <PlusCircle size={20} />
          <span>Log New Catch</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}

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
              "{insights?.insights?.[0] || 'Log your first session with catches to start seeing AI analytics!'}"
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="glass-card text-center py-4">
            <h6 className="opacity-50 text-uppercase mb-2 small">Total Catches</h6>
            <div className="display-6 fw-bold">{totalCatches}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center py-4">
            <h6 className="opacity-50 text-uppercase mb-2 small">Total Sessions</h6>
            <div className="display-6 fw-bold">48</div> {/* Mock for now */}
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center py-4">
             <Trophy size={20} color="#0AC4E0" className="mb-2" />
            <h6 className="opacity-50 text-uppercase mb-2 small">Biggest Fish</h6>
            <div className="display-6 fw-bold">{biggestFish > 0 ? `${biggestFish.toFixed(1)} kg` : '--'}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center py-4">
            <h6 className="opacity-50 text-uppercase mb-2 small">Hours Logged</h6>
            <div className="display-6 fw-bold">214h</div> {/* Mock for now */}
          </div>
        </div>
      </div>

      {/* Latest Catches Section */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Recent Catches</h4>
          <Link to="/catches" className="text-accent text-decoration-none small">View All</Link>
        </div>
        
        {recentCatches.length > 0 ? (
          <div className="row g-3">
            {recentCatches.map((catchItem) => (
              <div className="col-md-3" key={catchItem.id}>
                <div className="glass-card p-0 overflow-hidden">
                  <div style={{ height: '160px', backgroundColor: '#0992C2', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {catchItem.media && catchItem.media.length > 0 ? (
                      <img 
                        src={catchItem.media[0].file_url} 
                        alt={catchItem.fish?.name_en || 'Catch'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Waves size={48} className="opacity-25" />
                    )}
                  </div>
                  <div className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0 text-truncate" style={{ maxWidth: '70%' }}>
                        {catchItem.fish?.en_name || 'Unknown Fish'}
                      </h6>
                      <span className="badge bg-secondary">{catchItem.weight ? `${catchItem.weight} kg` : '--'}</span>
                    </div>
                    <div className="small d-flex align-items-center gap-1 opacity-50 mb-2">
                      <MapPin size={12} />
                      <span className="text-truncate">{catchItem.session?.location_name || 'Unknown Location'}</span>
                    </div>
                    <div className="small opacity-50">
                      {catchItem.catch_time ? new Date(catchItem.catch_time).toLocaleDateString() : '--'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card text-center py-5">
            <p className="mb-0 opacity-50">No catches logged yet. Go catch some fish!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
