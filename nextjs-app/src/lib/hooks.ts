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

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AlbumFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  artistId?: string;
}

export function useAlbums(filters: AlbumFilters = {}) {
  const {
    page = 1,
    limit = 10,
    search = '',
    sortBy = 'Title',
    sortOrder = 'asc',
    artistId
  } = filters;

  const queryKey = ['albums', page, limit, search, sortBy, sortOrder, artistId];

  return useQuery<PaginatedResponse<Album>>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });

      if (search) params.set('search', search);
      if (artistId) params.set('artistId', artistId);

      const response = await apiClient.get<PaginatedResponse<Album>>(`/albums?${params}`);
      return response;
    }
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
