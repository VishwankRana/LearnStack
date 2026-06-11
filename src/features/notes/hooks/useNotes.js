import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/useAuth';
import {
  fetchNotes,
  fetchNote,
  createNote,
  updateNote,
  deleteNote,
  summarizeNote,
} from '../api/notesApi';

export const NOTES_KEY = ['notes'];

export function useNotes(filters = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...NOTES_KEY, filters],
    queryFn: () => fetchNotes(filters, token),
    enabled: !!token,
  });
}

export function useNote(id) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...NOTES_KEY, id],
    queryFn: () => fetchNote(id, token),
    enabled: !!token && !!id,
  });
}

export function useCreateNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createNote(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
    },
  });
}

export function useUpdateNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateNote(id, data, token),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      if (updated?.id) {
        queryClient.setQueryData([...NOTES_KEY, updated.id], updated);
      }
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
    },
  });
}

export function useDeleteNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteNote(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
    },
  });
}

export function useSummarizeNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => summarizeNote(id, token),
    onSuccess: (updated) => {
      if (updated?.id) {
        queryClient.setQueryData([...NOTES_KEY, updated.id], updated);
      }
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}
