import { z } from 'zod';
import { ApiResponse, ApiResponseMetadata } from './api-utils';
import { Album, Artist, Track } from '@/types/database';

// API 응답 타입
export type ApiResponse<T> = {
  data: T;
  error: string | null;
};

// API 에러 타입
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API 설정
const API_BASE_URL = '/api';

// HTTP 메서드 타입
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// HTTP 요청 설정 타입
interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  data?: unknown;
}

// API 클라이언트 설정
interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
}

/**
 * API 응답 처리 함수
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError(
      data.message || 'API request failed',
      response.status,
      data
    );
  }

  return data as T;
}

/**
 * API 클라이언트 클래스
 */
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * URL 생성 함수
   */
  private createUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.toString();
  }

  /**
   * HTTP 요청 함수
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, data, headers, ...restConfig } = config;

    const url = this.createUrl(path, params);
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: data ? JSON.stringify(data) : undefined,
      ...restConfig,
    });

    return handleResponse<T>(response);
  }

  // GET 요청
  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', path, config);
  }

  // POST 요청
  async post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', path, { ...config, data });
  }

  // PUT 요청
  async put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', path, { ...config, data });
  }

  // DELETE 요청
  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', path, config);
  }
}

// API 클라이언트 인스턴스 생성
export const apiClient = new ApiClient();

// 데이터베이스 스키마 타입
export interface Album {
  id: string;
  name: string;
  artist_id: string;
  released_date: string;
}

export interface Artist {
  ArtistId: number;
  Name: string;
  albumCount?: number;
}

export interface Track {
  id: string;
  name: string;
  album_id: string;
  duration: number;
}

// 앨범 스키마 검증
export const albumSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist_id: z.string(),
  released_date: z.string(),
});

// 아티스트 스키마 검증
export const artistSchema = z.object({
  ArtistId: z.number(),
  Name: z.string(),
  albumCount: z.number().optional()
});

// 트랙 스키마 검증
export const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  album_id: z.string(),
  duration: z.number(),
});

export type AlbumData = z.infer<typeof albumSchema>;
export type ArtistData = z.infer<typeof artistSchema>;
export type TrackData = z.infer<typeof trackSchema>;

type RequestParams = Record<string, string | number>;

interface FetchOptions extends RequestInit {
  params?: RequestParams;
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...init } = options;
  
  let url = `/api${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '알 수 없는 오류가 발생했습니다.');
  }

  return data;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

function toPaginationParams(params?: PaginationParams): RequestParams | undefined {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
}

export const albumsApi = {
  getAll: (params?: PaginationParams) =>
    fetchApi<Album[]>('/albums', { params: toPaginationParams(params) }),

  getById: (id: number) =>
    fetchApi<Album>(`/albums/${id}`),

  create: (album: Omit<Album, 'id'>) =>
    fetchApi<Album>('/albums', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(album),
    }),

  update: (id: number, album: Partial<Album>) =>
    fetchApi<null>(`/albums/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(album),
    }),

  delete: (id: number) =>
    fetchApi<null>(`/albums/${id}`, { method: 'DELETE' }),
};

export const artistsApi = {
  getAll: (params?: PaginationParams) =>
    fetchApi<Artist[]>('/artists', { params: toPaginationParams(params) }),

  getById: (id: number) =>
    fetchApi<Artist>(`/artists/${id}`),

  getAlbums: (id: number, params?: PaginationParams) =>
    fetchApi<Album[]>(`/artists/${id}/albums`, { params: toPaginationParams(params) }),
};

export const tracksApi = {
  getAll: (params?: PaginationParams) =>
    fetchApi<Track[]>('/tracks', { params: toPaginationParams(params) }),

  getByAlbum: (albumId: number, params?: PaginationParams) =>
    fetchApi<Track[]>(`/albums/${albumId}/tracks`, { params: toPaginationParams(params) }),
};

export interface StatsOverview {
  totalAlbums: number;
  totalArtists: number;
  totalTracks: number;
  avgTracksPerAlbum: number;
  topGenres: Array<{ name: string; count: number }>;
  topArtists: Array<{ name: string; albumCount: number }>;
}

export const statsApi = {
  getOverview: () =>
    fetchApi<StatsOverview>('/stats'),
};
