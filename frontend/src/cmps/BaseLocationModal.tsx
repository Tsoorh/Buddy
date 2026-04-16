import React, { useState } from 'react';
import Modal from './Modal';
import LocationPicker from './LocationPicker';
import { MapPin, Check } from 'lucide-react';
import { UserSettingsService, type UserLocation } from '../services/UserSettingsService';

interface BaseLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: UserLocation) => void;
}

const BaseLocationModal: React.FC<BaseLocationModalProps> = ({ isOpen, onClose, onSave }) => {
  const [selectedLoc, setSelectedLoc] = useState<UserLocation>({
    lat: 32.0853,
    lng: 34.7818,
    name: 'Tel Aviv, Israel' // Default if they just click save
  });
  const [locName, setLocName] = useState('Tel Aviv, Israel');

  const handleSave = () => {
    const finalLoc = { ...selectedLoc, name: locName };
    UserSettingsService.setLocalLocation(finalLoc);
    onSave(finalLoc);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Your Base Location">
      <div className="auth-form p-2">
        <p className="small text-white opacity-75 mb-4">
          Pin your favorite diving spot to get real-time weather and sea conditions on your dashboard.
        </p>

        <div className="mb-3">
          <label className="auth-label">Location Name</label>
          <input 
            className="auth-input w-100" 
            placeholder="e.g. Haifa Bay, Red Sea" 
            value={locName}
            onChange={(e) => setLocName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="auth-label d-flex align-items-center gap-2">
            <MapPin size={16} color="#0AC4E0" /> Pin on Map
          </label>
          <div className="rounded-3 overflow-hidden" style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <LocationPicker 
              lat={selectedLoc.lat} 
              lng={selectedLoc.lng} 
              onChange={(lat, lng) => setSelectedLoc({ ...selectedLoc, lat, lng })}
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="btn btn-accent w-100 py-3 d-flex align-items-center justify-content-center gap-2 shadow-lg"
        >
          <Check size={20} />
          Save Base Location
        </button>
      </div>
    </Modal>
  );
};

export default BaseLocationModal;
