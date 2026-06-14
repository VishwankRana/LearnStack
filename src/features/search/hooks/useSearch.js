import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../context/useAuth'
import { searchAll } from '../api/searchApi'

/**
 * Runs a global search query.
 * @param {string} query  — the search term (debounce it before passing in)
 * @param {{ page?: number, limit?: number }} [options]
 */
export function useSearch(query, { page = 1, limit = 10 } = {}) {
  const { token } = useAuth()
  const trimmed = query?.trim() ?? ''

  return useQuery({
    queryKey: ['search', trimmed, page, limit],
    queryFn: () => searchAll(token, { q: trimmed, page, limit }),
    enabled: trimmed.length > 0,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}
