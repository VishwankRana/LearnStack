import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/useAuth';
import {
  fetchCollections,
  fetchCollection,
  createCollection,
  updateCollection,
  deleteCollection,
} from '../api/collectionsApi';

const COLLECTIONS_KEY = ['collections'];

export function useCollections() {
  const { token } = useAuth();

  return useQuery({
    queryKey: COLLECTIONS_KEY,
    queryFn: () => fetchCollections(token),
    enabled: !!token,
  });
}

export function useCollection(id) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [...COLLECTIONS_KEY, id],
    queryFn: () => fetchCollection(id, token),
    enabled: !!token && !!id,
  });
}

export function useCreateCollection() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createCollection(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateCollection() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCollection(id, data, token),
    onSuccess: (updatedCollection) => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY });
      if (updatedCollection?.id) {
        queryClient.setQueryData(
          [...COLLECTIONS_KEY, updatedCollection.id],
          updatedCollection,
        );
      }
    },
  });
}

export function useDeleteCollection() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteCollection(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
