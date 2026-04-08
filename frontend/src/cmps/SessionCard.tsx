import React from 'react';
import { MapPin, Calendar, Droplets } from 'lucide-react';
import type { SessionResponse } from '../services/SessionService';

interface SessionCardProps {
  session: SessionResponse;
  onClick?: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onClick }) => {
  return (
    <div className="glass-card h-100 p-3 hover-scale cursor-pointer" onClick={onClick} style={{ minHeight: '140px' }}>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="text-sand text-truncate mb-0" style={{ maxWidth: '180px' }}>
          {session.location_name || 'Unnamed Session'}
        </h6>
        <span className={`badge ${session.is_public ? 'bg-accent text-primary' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
          {session.is_public ? 'Public' : 'Private'}
        </span>
      </div>
      
      <div className="d-flex flex-column gap-2 mt-3">
        <div className="small d-flex align-items-center gap-2 text-white opacity-75">
          <Calendar size={14} color="var(--accent-cyan)" />
          {session.date ? new Date(session.date).toLocaleDateString() : 'N/A'}
        </div>
        
        {session.visibility !== null && (
          <div className="small d-flex align-items-center gap-2 text-white opacity-75">
            <Droplets size={14} color="var(--accent-cyan)" />
            Visibility: {session.visibility}m
          </div>
        )}

        {session.max_depth !== null && (
          <div className="small d-flex align-items-center gap-2 text-white opacity-75">
            <MapPin size={14} color="var(--accent-cyan)" />
            Max Depth: {session.max_depth}m
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionCard;
