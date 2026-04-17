import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CatchService, type CatchResponse } from '../services/CatchService';
import { Loader2, Edit2, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import CatchCard from '../cmps/CatchCard';
import CatchEditModal from '../cmps/CatchEditModal';

const Catches: React.FC = () => {
  const { user } = useAuth();
  const [catches, setCatches] = useState<CatchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCatch, setSelectedCatch] = useState<CatchResponse | null>(null);

  const fetchCatches = async () => {
    try {
      setIsLoading(true);
      const data = await CatchService.getCatchesApi();
      setCatches(data);
    } catch {
      setError('Failed to load catches.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatches();
  }, []);

  const onHandleEdit = (item: CatchResponse) => {
    setSelectedCatch(item);
    setIsEditModalOpen(true);
  };

  const onHandleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this catch?')) return;
    try {
      await CatchService.deleteCatchApi(id);
      setCatches(prev => prev.filter(c => c.id !== id));
      alert('Catch deleted successfully!');
    } catch {
      alert('Failed to delete catch.');
    }
  };

  if (isLoading && catches.length === 0) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <Loader2 className="animate-spin" color="#0AC4E0" size={48} />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-sand">Tackle Box</h2>
        <Link to="/log-catch" className="btn btn-accent d-flex align-items-center gap-2">
          <Plus size={18} /> New Catch
        </Link>
      </div>

      {error && <div className="alert alert-danger glass-card border-0 text-white">{error}</div>}

      <div className="row g-4">
        {catches.map(item => {
          const isOwner = user?.id === item.user_id;
          return (
            <div key={item.id} className="col-md-6 col-lg-3 position-relative group">
              <CatchCard catchItem={item} />
              
              {isOwner && (
                <div className="position-absolute top-0 end-0 m-3 d-flex gap-2 opacity-0 group-hover-opacity-100 transition-all">
                  <button 
                    onClick={() => onHandleEdit(item)}
                    className="btn btn-dark btn-sm rounded-circle p-2" title="Edit Catch" style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid var(--accent-cyan)' }}
                  >
                    <Edit2 size={14} color="var(--accent-cyan)" />
                  </button>
                  <button 
                    onClick={() => onHandleDelete(item.id)}
                    className="btn btn-dark btn-sm rounded-circle p-2" title="Delete Catch" style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid #ff4444' }}
                  >
                    <Trash2 size={14} color="#ff4444" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {catches.length === 0 && !error && (
        <div className="glass-card text-center py-5">
          <p className="text-white opacity-50">Your tackle box is empty.</p>
        </div>
      )}

      <CatchEditModal 
        isOpen={isEditModalOpen}
        catchItem={selectedCatch}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchCatches}
      />
    </div>
  );
};

export default Catches;
