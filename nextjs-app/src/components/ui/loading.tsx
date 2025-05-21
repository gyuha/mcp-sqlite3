'use client';

export default function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
