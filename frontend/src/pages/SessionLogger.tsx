import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SessionService, type SessionDetails } from '../services/SessionService';
import SessionForm from '../cmps/SessionForm';
import { Anchor } from 'lucide-react';

const SessionLogger: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onHandleSubmit = async (formData: SessionDetails) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      await SessionService.addSessionApi({
        ...formData,
        user_id: user.id
      });
      alert('Session logged successfully!');
      navigate('/sessions');
    } catch (err) {
      setError('Failed to log session. Please check your data.');
    } finally {
      setIsLoading(false);
    }
  };

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
