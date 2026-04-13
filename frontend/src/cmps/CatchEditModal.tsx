import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { CatchService, type CatchResponse, type CreateCatch } from '../services/CatchService';
import { FishService, type FishResponse } from '../services/FishService';
import { AuthInput } from './AuthShared';
import { Loader2, Trash2 } from 'lucide-react';
import DateTimePicker from './DateTimePicker';

interface CatchEditModalProps {
  catchItem: CatchResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CatchEditModal: React.FC<CatchEditModalProps> = ({ catchItem, isOpen, onClose, onSuccess }) => {
  const [fishList, setFishList] = useState<FishResponse[]>([]);
  const [formData, setFormData] = useState<Partial<CreateCatch>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFish = async () => {
      try {
        const data = await FishService.getFishListApi();
        setFishList(data);
      } catch {
        console.error('Failed to load fish species.');
      }
    };
    fetchFish();
  }, []);

  useEffect(() => {
    if (catchItem) {
      setFormData({
        fish_id: catchItem.fish_id,
        weight: catchItem.weight,
        free_text: catchItem.free_text || '',
        catch_time: catchItem.catch_time ? new Date(catchItem.catch_time).toISOString().slice(0, 16) : ''
      });
    }
  }, [catchItem]);

  const onHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catchItem) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const payload: CreateCatch = {
        user_id: catchItem.user_id,
        session_id: catchItem.session_id,
        fish_id: formData.fish_id || catchItem.fish_id,
        weight: formData.weight,
        free_text: formData.free_text,
        catch_time: formData.catch_time
      };

      await CatchService.updateCatchApi(catchItem.id, payload);
      onSuccess();
      onClose();
    } catch {
      setError('Failed to update catch.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRemoveMedia = async (mediaId: string) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await CatchService.deleteCatchMediaApi(mediaId);
      onSuccess(); // Refresh to update media list
    } catch {
      alert('Failed to delete photo.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Catch">
      <form onSubmit={onHandleSubmit} className="auth-form">
        {error && <div className="alert alert-danger border-0 glass-card text-white mb-3 small">{error}</div>}
        
        <div className="mb-3">
          <label className="auth-label">Species</label>
          <select 
            className="form-select auth-input" required
            value={formData.fish_id || ''}
            onChange={e => setFormData({...formData, fish_id: e.target.value})}
          >
            <option value="">Select Fish...</option>
            {fishList.map(f => (
              <option key={f.id} value={f.id}>{f.en_name} ({f.he_name})</option>
            ))}
          </select>
        </div>

        <div className="row">
          <div className="col-6">
            <AuthInput 
              label="Weight (kg)" type="number" step="0.1" value={formData.weight || 0} 
              onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} 
            />
          </div>
          <div className="col-6">
            <DateTimePicker 
              label="Time" value={formData.catch_time || ''} 
              onChange={val => setFormData({...formData, catch_time: val})} 
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="auth-label">Notes</label>
          <textarea 
            className="auth-input w-100" rows={3}
            value={formData.free_text || ''}
            onChange={e => setFormData({...formData, free_text: e.target.value})}
          ></textarea>
        </div>

        {/* Media Preview */}
        {catchItem?.media && catchItem.media.length > 0 && (
          <div className="mb-4">
            <label className="auth-label mb-2">Photos</label>
            <div className="d-flex gap-2 overflow-x-auto pb-2">
              {catchItem.media.map(m => (
                <div key={m.id} className="position-relative" style={{ minWidth: '80px', height: '80px' }}>
                  <img src={m.file_url} className="rounded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" onClick={() => onRemoveMedia(m.id)}
                    className="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 p-1"
                    style={{ transform: 'translate(30%, -30%)', width: '24px', height: '24px' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-accent w-100 py-3 mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
        </button>
      </form>
    </Modal>
  );
};

export default CatchEditModal;
