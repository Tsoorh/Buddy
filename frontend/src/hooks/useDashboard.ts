import { useState, useEffect } from 'react';
import { CatchService, type CatchResponse } from '../services/CatchService';
import { AnalyticsService, type AIInsightsResponse } from '../services/AnalyticsService';
import { SessionService, type SessionResponse } from '../services/SessionService';

export const useDashboard = () => {
  const [catches, setCatches] = useState<CatchResponse[]>([]);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catchesData, insightsData, sessionsData] = await Promise.all([
          CatchService.getCatchesApi(),
          AnalyticsService.getInsightsApi(),
          SessionService.getSessionsApi()
        ]);
        setCatches(catchesData);
        setInsights(insightsData);
        setSessions(sessionsData);
      } catch (err: unknown) {
        console.error('Dashboard Fetch Error:', err);
        setError('Failed to sync with the sea. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateHoursLogged = (sessionsData: SessionResponse[]) => {
    let totalMinutes = 0;
    sessionsData.forEach(s => {
      if (s.entry_time && s.exit_time) {
        const start = new Date(s.entry_time).getTime();
        const end = new Date(s.exit_time).getTime();
        totalMinutes += (end - start) / (1000 * 60);
      }
    });
    return Math.round(totalMinutes / 60);
  };

  const stats = {
    totalCatches: catches.length,
    totalSessions: sessions.length,
    hoursLogged: calculateHoursLogged(sessions),
    biggestFish: catches.length > 0 ? Math.max(...catches.map(c => c.weight || 0)) : 0,
    recentCatches: [...catches]
      .sort((a, b) => new Date(b.catch_time || 0).getTime() - new Date(a.catch_time || 0).getTime())
      .slice(0, 4)
  };

  const aiTip = insights?.insights?.[0] || 'Log your first session with catches to start seeing AI analytics!';

  return { catches, insights, sessions, stats, aiTip, isLoading, error };
};
