import React, { useState } from 'react';
import { type SessionDetails } from '../services/SessionService';
import { AuthInput } from './AuthShared';
import { Loader2 } from 'lucide-react';
import LocationPicker from './LocationPicker';

interface SessionFormProps {
  initialData?: Partial<SessionDetails>;
  onSubmit: (data: SessionDetails) => Promise<void>;
  isLoading?: boolean;
  buttonText?: string;
}

const SessionForm: React.FC<SessionFormProps> = ({ 
  initialData, onSubmit, isLoading = false, buttonText = 'Save Session' 
}) => {
  const [formData, setFormData] = useState<SessionDetails>({
    location_name: initialData?.location_name || '',
    is_public: initialData?.is_public ?? true,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    visibility: initialData?.visibility || 0,
    max_depth: initialData?.max_depth || 0,
    min_depth: initialData?.min_depth || 0,
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    longest_hold_down_time: initialData?.longest_hold_down_time || 0,
    longest_hold_down_depth: initialData?.longest_hold_down_depth || 0,
    entry_time: initialData?.entry_time ? new Date(initialData.entry_time).toISOString().slice(0, 16) : '',
    exit_time: initialData?.exit_time ? new Date(initialData.exit_time).toISOString().slice(0, 16) : '',
    free_text: initialData?.free_text || '',
  });

  const onHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={onHandleSubmit} className="auth-form pb-4">
      <div className="section-divider mb-4"><span className="text-accent small fw-bold text-uppercase">Basic Information</span></div>
      
      <AuthInput 
        label="Location Name" required value={formData.location_name || ''} 
        onChange={e => setFormData({...formData, location_name: e.target.value})} 
        placeholder="e.g. North Beach, Eilat"
      />
      
      <div className="row">
        <div className="col-md-6">
          <AuthInput 
            label="Date" type="date" required value={formData.date || ''} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
          />
        </div>
        <div className="col-md-6">
           <AuthInput 
            label="Visibility (m)" type="number" value={formData.visibility || 0} 
            onChange={e => setFormData({...formData, visibility: parseInt(e.target.value)})} 
          />
        </div>
      </div>

      <div className="section-divider my-4"><span className="text-accent small fw-bold text-uppercase">GPS Coordinates</span></div>
      <div className="mb-4">
        <LocationPicker 
          lat={formData.latitude || 32.0853} 
          lng={formData.longitude || 34.7818} 
          onChange={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})} 
        />
        <div className="row mt-2">
            <div className="col-6">
                <small className="opacity-50">Lat: {formData.latitude?.toFixed(6)}</small>
            </div>
            <div className="col-6 text-end">
                <small className="opacity-50">Lng: {formData.longitude?.toFixed(6)}</small>
            </div>
        </div>
      </div>

      <div className="section-divider my-4"><span className="text-accent small fw-bold text-uppercase">Dive Details</span></div>
      <div className="row">
        <div className="col-md-6">
          <AuthInput 
            label="Min Depth (m)" type="number" value={formData.min_depth || 0} 
            onChange={e => setFormData({...formData, min_depth: parseFloat(e.target.value)})} 
          />
        </div>
        <div className="col-md-6">
          <AuthInput 
            label="Max Depth (m)" type="number" value={formData.max_depth || 0} 
            onChange={e => setFormData({...formData, max_depth: parseFloat(e.target.value)})} 
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <AuthInput 
            label="Longest Hold-down (sec)" type="number" value={formData.longest_hold_down_time || 0} 
            onChange={e => setFormData({...formData, longest_hold_down_time: parseInt(e.target.value)})} 
          />
        </div>
        <div className="col-md-6">
          <AuthInput 
            label="Deepest Hold-down (m)" type="number" value={formData.longest_hold_down_depth || 0} 
            onChange={e => setFormData({...formData, longest_hold_down_depth: parseFloat(e.target.value)})} 
          />
        </div>
      </div>

      <div className="section-divider my-4"><span className="text-accent small fw-bold text-uppercase">Timing</span></div>
      <div className="row">
        <div className="col-md-6">
          <AuthInput 
            label="Entry Time" type="datetime-local" value={formData.entry_time || ''} 
            onChange={e => setFormData({...formData, entry_time: e.target.value})} 
          />
        </div>
        <div className="col-md-6">
          <AuthInput 
            label="Exit Time" type="datetime-local" value={formData.exit_time || ''} 
            onChange={e => setFormData({...formData, exit_time: e.target.value})} 
          />
        </div>
      </div>

      <div className="section-divider my-4"><span className="text-accent small fw-bold text-uppercase">Other</span></div>
      <div className="mb-3">
        <label className="auth-label">Notes</label>
        <textarea 
          className="auth-input w-100" rows={3}
          placeholder="Visibility, current, water temp, etc."
          value={formData.free_text || ''}
          onChange={e => setFormData({...formData, free_text: e.target.value})}
        ></textarea>
      </div>

      <div className="form-check form-switch mb-4">
        <input 
          className="form-check-input" type="checkbox" role="switch" id="isPublicSession" 
          checked={formData.is_public}
          onChange={e => setFormData({...formData, is_public: e.target.checked})}
        />
        <label className="form-check-label text-white small" htmlFor="isPublicSession">Public Session</label>
      </div>

      <button type="submit" className="btn btn-accent w-100 py-3 shadow" disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : buttonText}
      </button>
    </form>
  );
};

export default SessionForm;
