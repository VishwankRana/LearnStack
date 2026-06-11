import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/useAuth';
import {
  fetchDocuments,
  fetchDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  summarizeDocument,
} from '../api/documentsApi';

export const DOCUMENTS_KEY = ['documents'];

export function useDocuments(filters = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...DOCUMENTS_KEY, filters],
    queryFn: () => fetchDocuments(filters, token),
    enabled: !!token,
  });
}

export function useDocument(id) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...DOCUMENTS_KEY, id],
    queryFn: () => fetchDocument(id, token),
    enabled: !!token && !!id,
  });
}

export function useUploadDocument() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadDocument(formData, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
    },
  });
}

export function useUpdateDocument() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateDocument(id, data, token),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      if (updated?.id) {
        queryClient.setQueryData([...DOCUMENTS_KEY, updated.id], updated);
      }
    },
  });
}

export function useDeleteDocument() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteDocument(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-content'] });
    },
  });
}

export function useSummarizeDocument() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => summarizeDocument(id, token),
    onSuccess: (updated) => {
      if (updated?.id) {
        queryClient.setQueryData([...DOCUMENTS_KEY, updated.id], updated);
      }
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });
}
