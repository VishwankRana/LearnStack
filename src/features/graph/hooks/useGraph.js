import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../context/useAuth'
import { fetchGraph } from '../api/graphApi'

export function useGraph() {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['knowledge-graph'],
    queryFn: () => fetchGraph(token),
    enabled: !!token,
    staleTime: 60_000,
  })
}
