import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../context/useAuth'
import { commitSnapshot, fetchVersions, fetchVersion, restoreVersion } from '../api/versionsApi'
import { NOTES_KEY } from './useNotes'

export function useCommitSnapshot(noteId) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => commitSnapshot(noteId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...NOTES_KEY, noteId, 'versions'] })
    },
  })
}

export function useVersions(noteId) {
  const { token } = useAuth()

  return useQuery({
    queryKey: [...NOTES_KEY, noteId, 'versions'],
    queryFn: () => fetchVersions(noteId, token),
    enabled: !!token && !!noteId,
    staleTime: 15_000,
  })
}

export function useVersion(noteId, versionId) {
  const { token } = useAuth()

  return useQuery({
    queryKey: [...NOTES_KEY, noteId, 'versions', versionId],
    queryFn: () => fetchVersion(noteId, versionId, token),
    enabled: !!token && !!noteId && !!versionId,
    staleTime: 60_000,
  })
}

export function useRestoreVersion(noteId) {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId) => restoreVersion(noteId, versionId, token),
    onSuccess: (restoredNote) => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY })
      // Eagerly update the note cache so the editor refreshes immediately
      if (restoredNote?.id) {
        queryClient.setQueryData([...NOTES_KEY, restoredNote.id], restoredNote)
      }
      queryClient.invalidateQueries({ queryKey: [...NOTES_KEY, noteId, 'versions'] })
    },
  })
}
