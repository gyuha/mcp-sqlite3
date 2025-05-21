import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import type { Album, Artist, Track } from './api-client';

// Artists
export function useArtists() {
  return useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const response = await apiClient.get<{ items: Artist[] }>('/artists');
      return response.items;
    },
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: ['artists', id],
    queryFn: () => apiClient.get<Artist>(`/artists/${id}`),
  });
}

// Albums
interface AlbumResponse {
  Title: string;
  AlbumId: number;
  ArtistId: number;
}

export function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: { items: AlbumResponse[] } }>('/albums');
      return response.data.items;
    },
  });
}

export function useAlbum(id: string) {
  return useQuery({
    queryKey: ['albums', id],
    queryFn: () => apiClient.get<Album>(`/albums/${id}`),
  });
}

// Tracks
export function useTracks(albumId?: string) {
  return useQuery({
    queryKey: ['tracks', albumId],
    queryFn: () => apiClient.get<Track[]>(`/tracks${albumId ? `?album_id=${albumId}` : ''}`),
  });
}

export function useTrack(id: string) {
  return useQuery({
    queryKey: ['tracks', id],
    queryFn: () => apiClient.get<Track>(`/tracks/${id}`),
  });
}

// Mutations
export function useCreateAlbum() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newAlbum: Partial<Album>) => 
      apiClient.post<Album>('/albums', newAlbum),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}

export function useUpdateAlbum() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Album> & { id: string }) =>
      apiClient.put<Album>(`/albums/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['albums', variables.id] });
    },
  });
}

export function useDeleteAlbum() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<void>(`/albums/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });
}
