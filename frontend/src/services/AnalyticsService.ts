import HttpService from './HttpService';
import type { AxiosResponse } from 'axios';

export interface AIInsightsResponse {
  insights: string[];
  optimal_conditions: string;
  generated_at: string | null;
}

export const AnalyticsService = {
  getInsightsApi: async (): Promise<AIInsightsResponse> => {
    const response: AxiosResponse<AIInsightsResponse> = await HttpService.get('/analytics/insights');
    return response.data;
  }
};
