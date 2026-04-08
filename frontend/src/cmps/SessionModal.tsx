import React, { useState } from 'react';
import Modal from './Modal';
import { SessionService, type SessionResponse, type SessionDetails } from '../services/SessionService';
import SessionForm from './SessionForm';
import { useAuth } from '../context/AuthContext';

interface SessionModalProps {
  session?: SessionResponse | null; // If provided, it's Edit mode
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sessionId: string) => void;
}

const SessionModal: React.FC<SessionModalProps> = ({ session, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onHandleSubmit = async (formData: SessionDetails) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      let sessionId = '';
      if (session) {
        // Edit Mode
        await SessionService.updateSessionApi(session.id, formData);
        sessionId = session.id;
      } else {
        // Create Mode
        sessionId = await SessionService.addSessionApi({
          ...formData,
          user_id: user.id
        });
      }
      
      onSuccess(sessionId);
      onClose();
    } catch (err) {
      setError(`Failed to ${session ? 'update' : 'create'} session.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={session ? "Edit Session" : "Create New Session"}>
      {error && <div className="alert alert-danger border-0 glass-card text-white mb-3 small">{error}</div>}
      <SessionForm 
        initialData={session || {}} 
        onSubmit={onHandleSubmit} 
        isLoading={isLoading} 
        buttonText={session ? "Save Changes" : "Create Session"}
      />
    </Modal>
  );
};

export default SessionModal;
