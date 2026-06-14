import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../context/useAuth'
import { fetchActivities, fetchRecentActivities } from '../api/activitiesApi'

const LIMIT = 20

export function useActivities() {
  const { token } = useAuth()

  return useInfiniteQuery({
    queryKey: ['activities'],
    queryFn: ({ pageParam = 1 }) => fetchActivities(token, { page: pageParam, limit: LIMIT }),
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta
      if (!meta) return undefined
      return meta.hasMore ? meta.page + 1 : undefined
    },
    enabled: !!token,
  })
}

export function useRecentActivities(limit = 10) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['recent-activities', limit],
    queryFn: () => fetchRecentActivities(token, limit),
    enabled: !!token,
  })
}
