import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fish, Weight, Camera, MapPin, CheckCircle2, ChevronRight, ChevronLeft, Save } from 'lucide-react';

const CatchLogger: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    species: '',
    weight: '',
    length: '',
    notes: '',
    media: null as File | null,
    location: 'Current Location (Auto)',
    depth: '12m',
    waterTemp: '19°C'
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to save catch via API
    console.log('Saving catch:', formData);
    alert('Catch saved successfully!');
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h4 className="mb-4 d-flex align-items-center gap-2">
              <Fish color="#0AC4E0" /> What did you catch?
            </h4>
            <div className="mb-3">
              <label className="form-label small opacity-50">Species Name</label>
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary" 
                placeholder="e.g. Bass, Grouper, Tuna"
                value={formData.species}
                onChange={e => setFormData({...formData, species: e.target.value})}
              />
            </div>
            <div className="row g-2">
              {['Bass', 'Grouper', 'Snapper', 'Tuna'].map(s => (
                <div className="col-6 col-md-3" key={s}>
                  <button 
                    type="button"
                    className={`btn w-100 py-3 ${formData.species === s ? 'btn-accent' : 'btn-outline-secondary'}`}
                    onClick={() => setFormData({...formData, species: s})}
                  >
                    {s}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h4 className="mb-4 d-flex align-items-center gap-2">
              <Weight color="#0AC4E0" /> Measurements
            </h4>
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label small opacity-50">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="form-control bg-dark text-white border-secondary" 
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                />
              </div>
              <div className="col-6">
                <label className="form-label small opacity-50">Length (cm)</label>
                <input 
                  type="number" 
                  className="form-control bg-dark text-white border-secondary" 
                  value={formData.length}
                  onChange={e => setFormData({...formData, length: e.target.value})}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small opacity-50">Notes</label>
              <textarea 
                className="form-control bg-dark text-white border-secondary" 
                rows={3}
                placeholder="How was the fight? What lure did you use?"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              ></textarea>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h4 className="mb-4 d-flex align-items-center gap-2">
              <Camera color="#0AC4E0" /> Proof of Catch
            </h4>
            <div className="border border-secondary border-dashed rounded-3 p-5 text-center mb-3" style={{ borderStyle: 'dashed' }}>
              <Camera size={48} className="opacity-25 mb-3" />
              <p className="small mb-0 opacity-50">Drag and drop or click to upload photo/video</p>
              <input type="file" className="d-none" id="catch-media" />
              <label htmlFor="catch-media" className="btn btn-outline-light btn-sm mt-3">Browse Files</label>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
            <h4 className="mb-4 d-flex align-items-center gap-2">
              <MapPin color="#0AC4E0" /> Environmental Data
            </h4>
            <div className="glass-card mb-4">
               <div className="d-flex justify-content-between mb-2">
                 <span className="opacity-50">Location</span>
                 <span>{formData.location}</span>
               </div>
               <div className="d-flex justify-content-between mb-2">
                 <span className="opacity-50">Depth</span>
                 <span>{formData.depth}</span>
               </div>
               <div className="d-flex justify-content-between">
                 <span className="opacity-50">Water Temp</span>
                 <span>{formData.waterTemp}</span>
               </div>
            </div>
            <div className="alert alert-info bg-transparent border-accent text-accent small">
               <CheckCircle2 size={16} className="me-2" />
               Environmental data was automatically captured for your session.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="glass-card border-0 shadow-lg">
            {/* Progress Bar */}
            <div className="progress mb-4 bg-dark" style={{ height: '6px' }}>
              <div 
                className="progress-bar bg-accent" 
                role="progressbar" 
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ minHeight: '300px' }}>
                {renderStep()}
              </div>

              <div className="d-flex justify-content-between mt-5 pt-3 border-top border-secondary">
                <button 
                  type="button" 
                  className={`btn btn-link text-white text-decoration-none ${step === 1 ? 'invisible' : ''}`}
                  onClick={handleBack}
                >
                  <ChevronLeft size={20} className="me-1" /> Back
                </button>
                
                {step < 4 ? (
                  <button 
                    type="button" 
                    className="btn btn-accent px-4 d-flex align-items-center gap-2"
                    onClick={handleNext}
                  >
                    Next <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="btn btn-accent px-5 d-flex align-items-center gap-2"
                  >
                    <Save size={20} /> Save Catch
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatchLogger;
