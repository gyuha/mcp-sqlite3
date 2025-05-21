import { NextResponse } from 'next/server';

export interface ApiResponseMetadata {
  totalCount?: number;
  pageCount?: number;
  currentPage?: number;
  message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: ApiResponseMetadata;
}

export function createApiResponse<T>(
  data: T,
  metadata?: ApiResponseMetadata
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    metadata
  });
}

export function createSuccessMessage(
  message: string
): NextResponse<ApiResponse<null>> {
  return NextResponse.json({
    success: true,
    data: null,
    metadata: { message }
  });
}

export function createErrorResponse(
  error: string,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
  return createErrorResponse(message);
}
