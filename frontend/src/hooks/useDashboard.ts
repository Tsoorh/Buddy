import { useState, useEffect } from 'react';
import { CatchService, type CatchResponse } from '../services/CatchService';
import { AnalyticsService, type AIInsightsResponse } from '../services/AnalyticsService';

export const useDashboard = () => {
  const [catches, setCatches] = useState<CatchResponse[]>([]);
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catchesData, insightsData] = await Promise.all([
          CatchService.getCatchesApi(),
          AnalyticsService.getInsightsApi()
        ]);
        setCatches(catchesData);
        setInsights(insightsData);
      } catch (err: unknown) {
        console.error('Dashboard Fetch Error:', err);
        setError('Failed to sync with the sea. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    totalCatches: catches.length,
    biggestFish: catches.length > 0 ? Math.max(...catches.map(c => c.weight || 0)) : 0,
    recentCatches: [...catches]
      .sort((a, b) => new Date(b.catch_time || 0).getTime() - new Date(a.catch_time || 0).getTime())
      .slice(0, 4)
  };

  const aiTip = insights?.insights?.[0] || 'Log more sessions to unlock AI patterns!';

  return { catches, insights, stats, aiTip, isLoading, error };
};
