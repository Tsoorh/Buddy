import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SessionService, type SessionDetails } from '../services/SessionService';
import SessionForm from '../cmps/SessionForm';
import { Anchor, CheckCircle, PlusCircle, LayoutDashboard } from 'lucide-react';

const SessionLogger: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const onHandleSubmit = async (formData: SessionDetails) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const newSessionId = await SessionService.addSessionApi({
        ...formData,
        user_id: user.id
      });
      setSuccessId(newSessionId);
    } catch {
      setError('Failed to log session. Please check your data.');
    } finally {
      setIsLoading(false);
    }
  };

  if (successId) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="glass-card shadow-lg p-5 animate-fade-in">
              <CheckCircle size={64} color="#0AC4E0" className="mb-4" />
              <h2 className="text-sand mb-3">Session Logged!</h2>
              <p className="text-white opacity-75 mb-5 fs-5">Your dive session has been recorded successfully. Would you like to add some catches now?</p>
              
              <div className="d-grid gap-3">
                <Link to={`/log-catch?sessionId=${successId}`} className="btn btn-accent btn-lg py-3 d-flex align-items-center justify-content-center gap-2">
                  <PlusCircle size={20} /> Add Catches to this Session
                </Link>
                <Link to="/dashboard" className="btn btn-outline-info btn-lg py-3 d-flex align-items-center justify-content-center gap-2">
                  <LayoutDashboard size={20} /> Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="glass-card shadow-lg p-4">
            <div className="text-center mb-4">
              <Anchor size={48} color="var(--accent-cyan)" className="mb-3 opacity-75" />
              <h2 className="text-sand">Log Fishing Session</h2>
              <p className="text-white opacity-50">Record your dive even if you didn't catch anything.</p>
            </div>

            {error && <div className="alert alert-danger border-0 glass-card text-white mb-4 text-center">{error}</div>}

            <SessionForm onSubmit={onHandleSubmit} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionLogger;
