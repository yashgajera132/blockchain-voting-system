import React from 'react';

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }) {
  // Size classes based on the parameter
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div 
        className={`${sizeClasses[size]} rounded-full border-blue-600 border-t-transparent animate-spin`}
        role="status"
        aria-label="loading"
      />
      {message && <p className="text-gray-600 font-medium text-sm">{message}</p>}
    </div>
  );
} 