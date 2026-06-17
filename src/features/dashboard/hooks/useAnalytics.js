import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/useAuth';
import { fetchDashboardAnalytics } from '../api/analyticsApi';

export const ANALYTICS_KEY = ['dashboard-analytics'];

export function useDashboardAnalytics() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ANALYTICS_KEY,
    queryFn: () => fetchDashboardAnalytics(token),
    enabled: !!token,
    staleTime: 60_000,
  });
}
