'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary">
        <span className="sr-only">Loading...</span>
      </div>
      <span className="ml-3 text-gray-600">로딩 중...</span>
    </div>
  );
}
