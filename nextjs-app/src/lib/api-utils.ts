import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function createSuccessResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message
  });
}

export function createErrorResponse(error: string, status: number = 500): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error
    },
    { status }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return createErrorResponse(error.message);
  }
  
  return createErrorResponse('An unexpected error occurred');
}
