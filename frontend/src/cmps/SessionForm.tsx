import React, { useState, useEffect } from 'react';
import { type SessionDetails, SessionService } from '../services/SessionService';

import { NumberInput } from './NumberInput';
import { Loader2, Calendar, MapPin, ArrowDown, Timer, MessageSquare } from 'lucide-react';
import LocationPicker from './LocationPicker';
import DateTimePicker from './DateTimePicker';

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
    latitude: initialData?.latitude || 32.0853,
    longitude: initialData?.longitude || 34.7818,
    longest_hold_down_time: initialData?.longest_hold_down_time || 0,
    longest_hold_down_depth: initialData?.longest_hold_down_depth || 0,
    entry_time: initialData?.entry_time ? new Date(initialData.entry_time).toISOString().slice(0, 16) : '',
    exit_time: initialData?.exit_time ? new Date(initialData.exit_time).toISOString().slice(0, 16) : '',
    visibility: initialData?.visibility || 0,
    wave_height: initialData?.wave_height || 0,
    free_text: initialData?.free_text || '',
  });

  const [recentLocations, setRecentLocations] = useState<string[]>([]);

  const getErrors = () => {
    const errors: Record<string, string> = {};
    if (!formData.location_name?.trim()) errors.location_name = 'Location name is required';
    if ((formData.visibility || 0) < 0) errors.visibility = 'Visibility must be 0 or more';
    if ((formData.wave_height || 0) < 0) errors.wave_height = 'Wave height must be 0 or more';
    if ((formData.max_depth || 0) < (formData.min_depth || 0)) errors.max_depth = 'Max depth cannot be less than min depth';
    if ((formData.longest_hold_down_depth || 0) > (formData.max_depth || 0)) errors.longest_hold_down_depth = 'Hold-down depth cannot exceed session max depth';
    
    if (formData.entry_time && formData.exit_time) {
      if (new Date(formData.exit_time) <= new Date(formData.entry_time)) {
        errors.exit_time = 'Exit time must be after entry time';
      }
    }
    if (formData.entry_time && formData.date && formData.entry_time.split('T')[0] !== formData.date) {
      errors.entry_time = 'Entry date must match the session date';
    }
    return errors;
  };

  const errors = getErrors();
  const isValid = Object.keys(errors).length === 0;

  useEffect(() => {
    const fetchRecentLocations = async () => {
      try {
        const sessions = await SessionService.getSessionsApi();
        const locations = sessions
          .map(s => s.location_name)
          .filter((name): name is string => !!name);
        const uniqueLocations = Array.from(new Set(locations)).slice(0, 10);
        setRecentLocations(uniqueLocations);
      } catch (err) {
        console.error('Failed to fetch recent locations', err);
      }
    };
    fetchRecentLocations();
  }, []);

  const onHandleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let newValue: string | number | boolean = value;

    if (type === 'number') newValue = value === '' ? 0 : parseFloat(value);
    if (type === 'checkbox') newValue = (e.target as HTMLInputElement).checked;

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-match date when entry_time changes
      if (name === 'entry_time' && value) {
        updated.date = value.split('T')[0];
      }
      
      return updated;
    });
  };

  const onHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={onHandleSubmit} className="auth-form pb-4">
      <div className="section-divider mb-4">
        <span className="text-accent small fw-bold text-uppercase d-flex align-items-center gap-2">
          <MapPin size={16} /> Basic Information
        </span>
      </div>
      
      <div className="mb-3">
        <label className="auth-label">Location Name</label>
        <input 
          name="location_name"
          className={`auth-input w-100 ${errors.location_name ? 'border-danger' : ''}`}
          required 
          value={formData.location_name || ''} 
          onChange={onHandleChange} 
          placeholder="e.g. North Beach, Eilat"
          list="recent-locations"
        />
        {errors.location_name && <small className="text-danger d-block mt-1">{errors.location_name}</small>}
        <datalist id="recent-locations">
          {recentLocations.map(loc => <option key={loc} value={loc} />)}
        </datalist>
      </div>
      
      <div className="row">
        <div className="col-md-4">
          <DateTimePicker 
            label="Date" 
            value={formData.date || ''} 
            showTime={false}
            onChange={(val) => setFormData(prev => ({ 
              ...prev, 
              date: val
            }))} 
          />
        </div>
        <div className="col-md-4 pt-md-0 pt-3">
           <NumberInput 
            label="Visibility (m)" name="visibility" value={formData.visibility || 0} 
            onChange={(val) => setFormData(prev => ({ ...prev, visibility: val }))} 
            hint={errors.visibility}
          />
        </div>
        <div className="col-md-4 pt-md-0 pt-3">
           <NumberInput 
            label="Wave Height (m)" name="wave_height" value={formData.wave_height || 0} 
            onChange={(val) => setFormData(prev => ({ ...prev, wave_height: val }))} 
            hint={errors.wave_height}
          />
        </div>
      </div>

      <div className="section-divider my-4">
        <span className="text-accent small fw-bold text-uppercase d-flex align-items-center gap-2">
          <Calendar size={16} /> GPS Coordinates
        </span>
      </div>
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

      <div className="section-divider my-4">
        <span className="text-accent small fw-bold text-uppercase d-flex align-items-center gap-2">
          <ArrowDown size={16} /> Dive Details
        </span>
      </div>
      <div className="row">
        <div className="col-md-6">
          <NumberInput 
            label="Min Depth (m)" name="min_depth" value={formData.min_depth || 0} 
            onChange={(val) => setFormData(prev => ({ ...prev, min_depth: val }))} 
          />
        </div>
        <div className="col-md-6">
          <NumberInput 
            label="Max Depth (m)" name="max_depth" value={formData.max_depth || 0} 
            onChange={(val) => setFormData(prev => ({ ...prev, max_depth: val }))} 
            hint={errors.max_depth}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <NumberInput 
            label="Longest Hold-down (sec)" name="longest_hold_down_time" value={formData.longest_hold_down_time || 0} 
            onChange={(val) => setFormData(prev => ({ ...prev, longest_hold_down_time: val }))} 
          />
        </div>
        <div className="col-md-6">
          <NumberInput 
            label="Deepest Hold-down (m)" name="longest_hold_down_depth" value={formData.longest_hold_down_depth || 0} 
            onChange={(val) => setFormData(prev => ({ ...prev, longest_hold_down_depth: val }))} 
            hint={errors.longest_hold_down_depth}
          />
        </div>
      </div>

      <div className="section-divider my-4">
        <span className="text-accent small fw-bold text-uppercase d-flex align-items-center gap-2">
          <Timer size={16} /> Timing
        </span>
      </div>
      <div className="glass-card p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <DateTimePicker 
              label="Entry Time" 
              value={formData.entry_time || ''} 
              onChange={(val) => {
                setFormData(prev => ({ 
                  ...prev, 
                  entry_time: val,
                  date: val.split('T')[0] 
                }));
              }} 
            />
            {errors.entry_time && <small className="text-danger d-block mt-1">{errors.entry_time}</small>}
          </div>
          <div className="col-md-6">
            <DateTimePicker 
              label="Exit Time" 
              value={formData.exit_time || ''} 
              onChange={(val) => setFormData(prev => ({ ...prev, exit_time: val }))} 
            />
            {errors.exit_time && <small className="text-danger d-block mt-1">{errors.exit_time}</small>}
          </div>
        </div>
      </div>

      <div className="section-divider my-4">
        <span className="text-accent small fw-bold text-uppercase d-flex align-items-center gap-2">
          <MessageSquare size={16} /> Other
        </span>
      </div>
      <div className="mb-3">
        <label className="auth-label">Notes</label>
        <textarea 
          name="free_text"
          className="auth-input w-100" rows={3}
          placeholder="Visibility, current, water temp, etc."
          value={formData.free_text || ''}
          onChange={onHandleChange}
        ></textarea>
      </div>

      <div className="form-check form-switch mb-4">
        <input 
          className="form-check-input" type="checkbox" role="switch" id="isPublicSession" 
          name="is_public"
          checked={formData.is_public}
          onChange={onHandleChange}
        />
        <label className="form-check-label text-white small" htmlFor="isPublicSession">Public Session</label>
      </div>

      <button type="submit" className="btn btn-accent w-100 py-3 shadow d-flex align-items-center justify-content-center gap-2" disabled={isLoading || !isValid}>
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : buttonText}
      </button>
    </form>
  );
};

export default SessionForm;
