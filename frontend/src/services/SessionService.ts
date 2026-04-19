import HttpService from './HttpService';
import type { AxiosResponse } from 'axios';

export interface SessionDetails {
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  min_depth?: number | null;
  max_depth?: number | null;
  is_public: boolean;
  free_text?: string | null;
  longest_hold_down_time?: number | null;
  longest_hold_down_depth?: number | null;
  entry_time?: string | null;
  exit_time?: string | null;
  visibility?: number | null;
  wave_height?: number | null;
  date?: string | null;
}

export interface CreateSession extends SessionDetails {
  user_id: string;
}

export interface SessionResponse extends CreateSession {
  id: string;
}

export interface SessionFilterBy {
  user_id?: string;
  location_name?: string;
  min_depth?: number;
  max_depth?: number;
  date?: string;
}

export const SessionService = {
  getSessionsApi: async (filters: SessionFilterBy = {}): Promise<SessionResponse[]> => {
    const response: AxiosResponse<SessionResponse[]> = await HttpService.get('/session/', { params: filters });
    return response.data;
  },

  addSessionApi: async (sessionData: CreateSession): Promise<string> => {
    const response: AxiosResponse<string> = await HttpService.post('/session/', sessionData);
    return response.data;
  },

  updateSessionApi: async (sessionId: string, sessionData: SessionDetails): Promise<boolean> => {
    const response: AxiosResponse<boolean> = await HttpService.put(`/session/${sessionId}`, sessionData);
    return response.data;
  },

  deleteSessionApi: async (sessionId: string): Promise<boolean> => {
    const response: AxiosResponse<boolean> = await HttpService.delete(`/session/${sessionId}`);
    return response.data;
  }
};
