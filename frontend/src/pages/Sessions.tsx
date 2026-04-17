import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SessionService, type SessionResponse } from '../services/SessionService';
import { Loader2, Edit2, Trash2, Plus } from 'lucide-react';
import SessionCard from '../cmps/SessionCard';
import SessionModal from '../cmps/SessionModal';

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await SessionService.getSessionsApi();
      setSessions(data);
    } catch {
      setError('Failed to load sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onHandleEdit = (session: SessionResponse) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const onHandleCreate = () => {
    setSelectedSession(null);
    setIsModalOpen(true);
  };

  const onHandleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await SessionService.deleteSessionApi(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      alert('Session deleted successfully!');
    } catch {
      alert('Failed to delete session.');
    }
  };

  if (isLoading && sessions.length === 0) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <Loader2 className="animate-spin" color="#0AC4E0" size={48} />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-sand">All Fishing Sessions</h2>
        <button onClick={onHandleCreate} className="btn btn-accent d-flex align-items-center gap-2">
          <Plus size={18} /> New Session
        </button>
      </div>

      {error && <div className="alert alert-danger glass-card border-0 text-white">{error}</div>}

      <div className="row g-4">
        {sessions.map(session => {
          const isOwner = user?.id === session.user_id;
          return (
            <div key={session.id} className="col-md-6 col-lg-4 position-relative group">
              <SessionCard session={session} />
              
              {isOwner && (
                <div className="position-absolute top-0 end-0 m-3 d-flex gap-2 opacity-0 group-hover-opacity-100 transition-all">
                  <button 
                    onClick={() => onHandleEdit(session)}
                    className="btn btn-dark btn-sm rounded-circle p-2" title="Edit Session" style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid var(--accent-cyan)' }}
                  >
                    <Edit2 size={14} color="var(--accent-cyan)" />
                  </button>
                  <button 
                    onClick={() => onHandleDelete(session.id)}
                    className="btn btn-dark btn-sm rounded-circle p-2" title="Delete Session" style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid #ff4444' }}
                  >
                    <Trash2 size={14} color="#ff4444" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sessions.length === 0 && !error && (
        <div className="glass-card text-center py-5">
          <p className="text-white opacity-50">No sessions found.</p>
        </div>
      )}

      <SessionModal 
        isOpen={isModalOpen}
        session={selectedSession}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchSessions}
      />
    </div>
  );
};

export default Sessions;
