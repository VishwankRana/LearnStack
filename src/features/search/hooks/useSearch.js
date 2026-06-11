import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/useAuth';
import { fetchSearchResults } from '../api/searchApi';

export function useSearch(query) {
  const { token } = useAuth();
  const trimmed = query?.trim() ?? '';

  return useQuery({
    queryKey: ['search', trimmed],
    queryFn: () => fetchSearchResults(trimmed, token),
    enabled: !!token && trimmed.length >= 3,
    staleTime: 30_000,
  });
}
