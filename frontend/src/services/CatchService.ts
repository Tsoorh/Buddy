import HttpService from './HttpService';
import type { AxiosResponse } from 'axios';

export interface CatchMediaResponse {
  id: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

export interface CatchResponse {
  id: string;
  user_id: string;
  fish_id: string;
  session_id: string;
  weight: number | null;
  free_text: string | null;
  catch_time: string | null;
  media: CatchMediaResponse[];
  fish?: {
    id: string;
    en_name: string;
    he_name: string;
  };
  session?: {
    id: string;
    location_name: string | null;
  };
}

export interface CatchFilterBy {
  user_id?: string;
  fish_id?: string;
  session_id?: string;
  min_weight?: number;
  free_text?: string;
}

export interface CreateCatch {
  user_id: string;
  fish_id: string;
  session_id: string;
  weight?: number | null;
  free_text?: string | null;
  catch_time?: string | null;
}

export const CatchService = {
  getCatchesApi: async (filters: CatchFilterBy = {}): Promise<CatchResponse[]> => {
    const response: AxiosResponse<CatchResponse[]> = await HttpService.get('/catch/', { params: filters });
    return response.data;
  },

  addCatchApi: async (catchData: CreateCatch): Promise<string> => {
    const response: AxiosResponse<string> = await HttpService.post('/catch/', catchData);
    return response.data;
  },

  addCatchMediaApi: async (catchId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response: AxiosResponse<string> = await HttpService.post(`/catch/${catchId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
