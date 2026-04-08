import React from 'react';
import { Waves, MapPin } from 'lucide-react';
import type { CatchResponse } from '../services/CatchService';

interface CatchCardProps {
  catchItem: CatchResponse;
}

const CatchCard: React.FC<CatchCardProps> = ({ catchItem }) => {
  return (
    <div className="glass-card p-0 overflow-hidden h-100">
      <div style={{ height: '160px', backgroundColor: '#0992C2', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {catchItem.media && catchItem.media.length > 0 ? (
          <img 
            src={catchItem.media[0].file_url} 
            alt={catchItem.fish?.en_name || 'Catch'} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Waves size={48} className="opacity-25 text-white" />
        )}
      </div>
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="mb-0 text-truncate text-sand" style={{ maxWidth: '70%' }}>
            {catchItem.fish?.en_name || 'Unknown Fish'}
          </h6>
          <span className="badge bg-secondary">{catchItem.weight ? `${catchItem.weight} kg` : '--'}</span>
        </div>
        <div className="small d-flex align-items-center gap-1 opacity-50 mb-2 text-white">
          <MapPin size={12} color="#0AC4E0" />
          <span className="text-truncate">{catchItem.session?.location_name || 'Unknown Location'}</span>
        </div>
        <div className="small opacity-50 text-white">
          {catchItem.catch_time ? new Date(catchItem.catch_time).toLocaleDateString() : '--'}
        </div>
      </div>
    </div>
  );
};

export default CatchCard;
