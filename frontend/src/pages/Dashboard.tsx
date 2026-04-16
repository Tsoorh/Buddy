import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { Link } from 'react-router-dom';
import { CloudRain, Wind, Thermometer, Waves, BrainCircuit, PlusCircle, Trophy, History, Loader2, Anchor, MapPin, Edit3, ArrowUp } from 'lucide-react';
import CatchCard from '../cmps/CatchCard';
import SessionCard from '../cmps/SessionCard';
import HorizontalScroll from '../cmps/HorizontalScroll';
import BaseLocationModal from '../cmps/BaseLocationModal';
import { UserSettingsService, type UserLocation } from '../services/UserSettingsService';
import { WeatherService, type CurrentConditions } from '../services/WeatherService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { sessions, stats, aiTip, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();
  
  const [baseLocation, setBaseLocation] = useState<UserLocation | null>(null);
  const [conditions, setConditions] = useState<CurrentConditions | null>(null);
  const [isConditionsLoading, setIsConditionsLoading] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    const loc = UserSettingsService.getLocalLocation();
    if (loc) {
      setBaseLocation(loc);
      fetchConditions(loc.lat, loc.lng);
    }
  }, []);

  const fetchConditions = async (lat: number, lng: number) => {
    try {
      setIsConditionsLoading(true);
      const data = await WeatherService.getCurrentConditions(lat, lng);
      setConditions(data);
    } catch (err) {
      console.error('Weather Fetch Error:', err);
    } finally {
      setIsConditionsLoading(false);
    }
  };

  const handleLocationSaved = (loc: UserLocation) => {
    setBaseLocation(loc);
    fetchConditions(loc.lat, loc.lng);
  };

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Get 10 most recent for horizontal scroll
  const recentSessionsList = [...sessions]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 10);

  const recentCatchesList = [...stats.recentCatches].slice(0, 10);

  if (isDashboardLoading) {
    return (
      <div className="container py-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <Loader2 size={48} className="animate-spin mb-3" color="#0AC4E0" />
        <p className="text-sand opacity-75">Diving for your data...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 text-sand">
            Good Morning, {user?.user_name || user?.first_name || 'SpearFreshFish'}!
          </h2>
          <p className="opacity-75 mb-0 text-white">Ready for your next deep-sea adventure?</p>
        </div>
        <div className="d-flex gap-3">
          <Link to="/log-session" className="btn btn-outline-info btn-lg d-flex align-items-center gap-2">
            <Anchor size={20} />
            <span>Log Session</span>
          </Link>
          <Link to="/log-catch" className="btn btn-accent btn-lg d-flex align-items-center gap-2">
            <PlusCircle size={20} />
            <span>Log New Catch</span>
          </Link>
        </div>

      </div>

      {dashboardError && <div className="alert alert-danger border-0 glass-card text-white mb-4">{dashboardError}</div>}

      {/* Hero Analytics Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="glass-card h-100 position-relative overflow-hidden">
             {/* Conditions Overlay/Prompt if no location */}
             {!baseLocation ? (
               <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5">
                  <MapPin size={48} className="text-accent mb-3 opacity-50" />
                  <h5 className="text-white mb-2">Local Sea Conditions</h5>
                  <p className="text-white opacity-50 small mb-4">Set your base location to see real-time weather and sea data.</p>
                  <button onClick={() => setIsLocationModalOpen(true)} className="btn btn-accent px-4 py-2">
                    Set Base Location
                  </button>
               </div>
             ) : (
               <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0 d-flex align-items-center gap-2 text-white">
                    <CloudRain size={20} color="#0AC4E0" />
                    Conditions at {baseLocation.name}
                  </h5>
                  <button onClick={() => setIsLocationModalOpen(true)} className="btn btn-link text-accent p-0 d-flex align-items-center gap-1 text-decoration-none small">
                    <Edit3 size={14} /> Change
                  </button>
                </div>

                {isConditionsLoading ? (
                  <div className="d-flex justify-content-center align-items-center py-4">
                    <Loader2 size={32} className="animate-spin text-accent" />
                  </div>
                ) : conditions ? (
                  <div className="row text-center text-white">
                    <ConditionItem icon={<Thermometer size={32} />} value={`${conditions.airTemp.toFixed(0)}°C`} label="Air" />
                    <ConditionItem icon={<Waves size={32} />} value={`${conditions.waterTemp.toFixed(1)}°C`} label="Water" />
                    <ConditionItem 
                      icon={
                        <div className="d-flex align-items-center justify-content-center position-relative mx-auto" style={{ width: '32px', height: '32px' }}>
                          <Wind size={18} className="opacity-25" />
                          <div 
                            className="position-absolute d-flex align-items-center justify-content-center"
                            style={{ 
                              top: 0, left: 0, right: 0, bottom: 0,
                              transform: `rotate(${conditions.windDirection}deg)`, 
                              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          >
                            <ArrowUp size={32} className="text-accent" />
                          </div>
                        </div>
                      } 
                      value={`${conditions.windSpeed.toFixed(0)} km/h ${getWindDirection(conditions.windDirection)}`} 
                      label="Wind" 
                    />
                    <ConditionItem icon={<History size={32} />} value={conditions.tideType} label="Tide" />
                  </div>
                ) : (
                  <p className="text-center text-white opacity-50 py-4">Failed to load local sea conditions.</p>
                )}
               </>
             )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass-card h-100 border-0 bg-gradient-cyan">
            <h5 className="mb-3 d-flex align-items-center gap-2" style={{ color: '#0AC4E0' }}>
              <BrainCircuit size={20} />
              AI Pro Tip
            </h5>
            <p className="mb-0 fs-5 text-sand italic">"{aiTip}"</p>
          </div>
        </div>
      </div>

      <BaseLocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        onSave={handleLocationSaved}
      />

      {/* Statistics Grid */}
      <div className="row g-4 mb-5">
        <StatCard label="Total Catches" value={stats.totalCatches} />
        <StatCard label="Total Sessions" value={stats.totalSessions} />
        <StatCard label="Biggest Fish" value={stats.biggestFish > 0 ? `${stats.biggestFish.toFixed(1)} kg` : '--'} icon={<Trophy size={20} color="#0AC4E0" />} />
        <StatCard label="Hours Logged" value={`${stats.hoursLogged}h`} />
      </div>

      {/* Recent Sessions */}
      <HorizontalScroll title="Recent Sessions" viewAllPath="/sessions">
        {recentSessionsList.length > 0 ? (
          recentSessionsList.map(session => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <EmptyState message="No sessions logged yet." link="/log-catch" icon={<Anchor size={48} />} />
        )}
      </HorizontalScroll>

      {/* Recent Catches */}
      <HorizontalScroll title="Recent Catches" viewAllPath="/catches">
        {recentCatchesList.length > 0 ? (
          recentCatchesList.map(item => (
            <CatchCard key={item.id} catchItem={item} />
          ))
        ) : (
          <EmptyState message="Your tackle box is empty." link="/log-catch" icon={<Waves size={48} />} />
        )}
      </HorizontalScroll>
    </div>
  );
};

/* --- Sub-Components for Cleanliness --- */

const ConditionItem: React.FC<{ icon: React.ReactNode, value: string, label: string }> = ({ icon, value, label }) => (
  <div className="col-3">
    <div className="opacity-75 mb-2">{icon}</div>
    <div className="h4 mb-0">{value}</div>
    <div className="small opacity-50">{label}</div>
  </div>
);

const StatCard: React.FC<{ label: string, value: string | number, icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="col-md-3">
    <div className="glass-card text-center py-4 text-white h-100">
      {icon && <div className="mb-2">{icon}</div>}
      <h6 className="opacity-50 text-uppercase mb-2 small">{label}</h6>
      <div className="display-6 fw-bold">{value}</div>
    </div>
  </div>
);

const EmptyState: React.FC<{ message: string, link: string, icon: React.ReactNode }> = ({ message, link, icon }) => (
  <div className="glass-card text-center py-5 w-100" style={{ minWidth: '100%' }}>
    <div className="opacity-25 mb-3">{icon}</div>
    <p className="text-white opacity-50 mb-3">{message}</p>
    <Link to={link} className="btn btn-outline-info btn-sm">Start Logging</Link>
  </div>
);

export default Dashboard;
