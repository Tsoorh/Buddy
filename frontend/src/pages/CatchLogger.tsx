import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Fish, Camera, MapPin, ChevronRight, ChevronLeft, Save, Plus, Loader2, Check } from 'lucide-react';
import { SessionService, type SessionResponse } from '../services/SessionService';
import { FishService, type FishResponse } from '../services/FishService';
import { CatchService } from '../services/CatchService';
import SessionModal from '../cmps/SessionModal';
import type { AxiosError } from 'axios';

const CatchLogger: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSessionId = searchParams.get('sessionId');

  const [step, setStep] = useState(initialSessionId ? 2 : 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [fishList, setFishList] = useState<FishResponse[]>([]);

  // Form State
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || '');
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const [catchData, setCatchData] = useState({
    fish_id: '',
    weight: '',
    free_text: '',
    catch_time: new Date().toISOString().slice(0, 16)
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [sessionsData, fishData] = await Promise.all([
        SessionService.getSessionsApi(),
        FishService.getFishListApi()
      ]);
      setSessions(sessionsData);
      setFishList(fishData);
      
      // Auto-select if sessionId in URL, otherwise most recent if nothing selected
      if (initialSessionId) {
        setSelectedSessionId(initialSessionId);
      } else if (sessionsData.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sessionsData[0].id);
      }
    } catch (err) {
      setError('Failed to load initial data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchInitialData();
  }, [user]);

  const onHandleNext = () => setStep(s => Math.min(s + 1, 3));
  const onHandleBack = () => setStep(s => Math.max(s - 1, 1));

  const onSessionCreated = async (sessionId: string) => {
    // Refresh sessions and select the new one
    await fetchInitialData();
    setSelectedSessionId(sessionId);
    // Move to next step automatically
    setStep(2);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSessionId) return;

    try {
      setIsLoading(true);
      setError(null);

      const catchId = await CatchService.addCatchApi({
        user_id: user.id,
        session_id: selectedSessionId,
        fish_id: catchData.fish_id,
        weight: catchData.weight ? parseFloat(catchData.weight) : null,
        free_text: catchData.free_text,
        catch_time: catchData.catch_time
      });

      if (selectedFile) {
        await CatchService.addCatchMediaApi(catchId, selectedFile);
      }

      alert('Catch logged successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ detail: string }>;
      setError(axiosError.response?.data?.detail || "Failed to log catch.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h4 className="mb-4 d-flex align-items-center gap-2 text-sand">
              <MapPin color="#0AC4E0" /> Step 1: Select Session
            </h4>
            
            <label className="form-label small opacity-50 text-white">Your Recent Sessions</label>
            <div className="d-flex flex-column gap-2 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {sessions.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`btn text-start p-3 glass-card border-0 transition-all ${selectedSessionId === s.id ? 'border-accent ring-1' : ''}`}
                  onClick={() => setSelectedSessionId(s.id)}
                  style={selectedSessionId === s.id ? { border: '1px solid #0AC4E0', backgroundColor: 'rgba(10, 196, 224, 0.1)' } : {}}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-white">{s.location_name || 'Unnamed Location'}</div>
                      <div className="small opacity-50 text-white">{s.date}</div>
                    </div>
                    {selectedSessionId === s.id && <Check size={18} color="#0AC4E0" />}
                  </div>
                </button>
              ))}
              {sessions.length === 0 && !isLoading && (
                <p className="text-center py-3 opacity-50">No sessions found. Create one to start!</p>
              )}
            </div>

            <button 
              type="button" className="btn btn-outline-info w-100 py-3 d-flex align-items-center justify-content-center gap-2" 
              onClick={() => setIsSessionModalOpen(true)}
            >
              <Plus size={18} /> Create New Session
            </button>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h4 className="mb-4 d-flex align-items-center gap-2 text-sand">
              <Fish color="#0AC4E0" /> Step 2: Catch Details
            </h4>
            <div className="mb-3">
              <label className="form-label text-white">Species</label>
              <select 
                className="form-select auth-input" required
                value={catchData.fish_id}
                onChange={e => setCatchData({...catchData, fish_id: e.target.value})}
              >
                <option value="">Select Fish...</option>
                {fishList.map(f => (
                  <option key={f.id} value={f.id}>{f.en_name} ({f.he_name})</option>
                ))}
              </select>
            </div>
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label text-white">Weight (kg)</label>
                <input 
                  type="number" step="0.1" className="form-control auth-input" 
                  value={catchData.weight}
                  onChange={e => setCatchData({...catchData, weight: e.target.value})}
                />
              </div>
              <div className="col-6">
                <label className="form-label text-white">Time</label>
                <input 
                  type="datetime-local" className="form-control auth-input" 
                  value={catchData.catch_time}
                  onChange={e => setCatchData({...catchData, catch_time: e.target.value})}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-white">Notes</label>
              <textarea 
                className="form-control auth-input" rows={3}
                placeholder="Details about the catch..."
                value={catchData.free_text}
                onChange={e => setCatchData({...catchData, free_text: e.target.value})}
              ></textarea>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h4 className="mb-4 d-flex align-items-center gap-2 text-sand">
              <Camera color="#0AC4E0" /> Step 3: Photo
            </h4>
            <div className="border border-secondary rounded-3 p-5 text-center mb-3" style={{ borderStyle: 'dashed' }}>
              {selectedFile ? (
                <div>
                  <Check size={48} className="text-accent mb-3" />
                  <p className="text-white">{selectedFile.name}</p>
                  <button type="button" className="btn btn-link text-danger" onClick={() => setSelectedFile(null)}>Remove</button>
                </div>
              ) : (
                <>
                  <Camera size={48} className="opacity-25 mb-3 text-white" />
                  <p className="small mb-0 opacity-50 text-white">Upload proof of your catch</p>
                  <input type="file" className="d-none" id="catch-media" onChange={onFileChange} accept="image/*" />
                  <label htmlFor="catch-media" className="btn btn-outline-light btn-sm mt-3">Browse Files</label>
                </>
              )}
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
          <div className="glass-card border-0 shadow-lg p-4">
            <div className="progress mb-4 bg-dark" style={{ height: '6px' }}>
              <div className="progress-bar bg-accent" role="progressbar" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>

            {error && <div className="alert alert-danger border-0 glass-card text-white mb-4">{error}</div>}

            <form onSubmit={onHandleSubmit}>
              <div style={{ minHeight: '350px' }}>
                {isLoading && step === 1 && sessions.length === 0 ? (
                   <div className="d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
                      <Loader2 className="animate-spin" color="#0AC4E0" size={48} />
                   </div>
                ) : renderStep()}
              </div>

              <div className="d-flex justify-content-between mt-5 pt-3 border-top border-secondary">
                <button 
                  type="button" 
                  className={`btn btn-link text-white text-decoration-none ${step === 1 ? 'invisible' : ''}`}
                  onClick={onHandleBack}
                  disabled={isLoading}
                >
                  <ChevronLeft size={20} className="me-1" /> Back
                </button>
                
                {step < 3 ? (
                  <button 
                    type="button" 
                    className="btn btn-accent px-4 d-flex align-items-center gap-2"
                    onClick={onHandleNext}
                    disabled={step === 1 && !selectedSessionId}
                  >
                    Next <ChevronRight size={20} />
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    className="btn btn-accent px-5 d-flex align-items-center gap-2"
                    disabled={isLoading || !catchData.fish_id}
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
                    Save Catch
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <SessionModal 
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSuccess={onSessionCreated}
      />
    </div>
  );
};

export default CatchLogger;
