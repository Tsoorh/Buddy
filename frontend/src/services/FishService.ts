import HttpService from './HttpService';
import type { AxiosResponse } from 'axios';

export interface FishResponse {
  id: string;
  he_name: string;
  en_name: string;
}

export const FishService = {
  getFishListApi: async (): Promise<FishResponse[]> => {
    const response: AxiosResponse<FishResponse[]> = await HttpService.get('/fish/');
    return response.data;
  }
};
