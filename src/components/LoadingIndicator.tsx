/**
 * ローディングインジケーターコンポーネント
 */

'use client';
import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span className="text-gray-600 text-sm">回答を生成中...</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;