export interface Album {
  AlbumId: number;
  Title: string;
  ArtistId: number;
  ArtistName?: string;
  TrackCount?: number;
  TotalDuration?: number;
}

export interface Artist {
  ArtistId: number;
  Name: string;
}

export interface Track {
  TrackId: number;
  Name: string;
  AlbumId: number;
  MediaTypeId: number;
  GenreId: number;
  Composer: string | null;
  Milliseconds: number;
  Bytes: number;
  UnitPrice: number;
}

export interface Genre {
  GenreId: number;
  Name: string;
}

export interface MediaType {
  MediaTypeId: number;
  Name: string;
}

export interface Customer {
  CustomerId: number;
  FirstName: string;
  LastName: string;
  Company: string | null;
  Address: string | null;
  City: string | null;
  State: string | null;
  Country: string | null;
  PostalCode: string | null;
  Phone: string | null;
  Fax: string | null;
  Email: string;
  SupportRepId: number | null;
}

export interface Employee {
  EmployeeId: number;
  LastName: string;
  FirstName: string;
  Title: string | null;
  ReportsTo: number | null;
  BirthDate: string | null;
  HireDate: string | null;
  Address: string | null;
  City: string | null;
  State: string | null;
  Country: string | null;
  PostalCode: string | null;
  Phone: string | null;
  Fax: string | null;
  Email: string | null;
}

export interface Invoice {
  InvoiceId: number;
  CustomerId: number;
  InvoiceDate: string;
  BillingAddress: string | null;
  BillingCity: string | null;
  BillingState: string | null;
  BillingCountry: string | null;
  BillingPostalCode: string | null;
  Total: number;
}

export interface InvoiceLine {
  InvoiceLineId: number;
  InvoiceId: number;
  TrackId: number;
  UnitPrice: number;
  Quantity: number;
}

export interface Playlist {
  PlaylistId: number;
  Name: string;
}

export interface PlaylistTrack {
  PlaylistId: number;
  TrackId: number;
}

// 쿼리 결과 타입 정의
export type QueryResult<T> = T[];
export type SingleResult<T> = T | null;

// 페이지네이션 타입 정의
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 통계 데이터 타입 정의
export interface AlbumStats {
  albumId: number;
  albumTitle: string;
  trackCount: number;
  totalDuration: number;
}

export interface ArtistStats {
  artistId: number;
  artistName: string;
  albumCount: number;
  trackCount: number;
}

export interface GenreStats {
  genreId: number;
  genreName: string;
  trackCount: number;
  totalDuration: number;
}
