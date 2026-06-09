import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/useAuth';
import {
  fetchBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from '../api/bookmarksApi';

export const BOOKMARKS_KEY = ['bookmarks'];

export function useBookmarks(filters = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...BOOKMARKS_KEY, filters],
    queryFn: () => fetchBookmarks(filters, token),
    enabled: !!token,
  });
}

export function useCreateBookmark() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createBookmark(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
    },
  });
}

export function useUpdateBookmark() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateBookmark(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
    },
  });
}

export function useDeleteBookmark() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteBookmark(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKMARKS_KEY });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
    },
  });
}
