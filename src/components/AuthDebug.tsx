'use client';

import React from 'react';
import { runAuthDiagnostics } from '../lib/auth';

// デバッグ用コンポーネント
export const AuthDebug: React.FC = () => {
  const checkEnvVars = () => {
    const envVars = {
      NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,
      NEXT_PUBLIC_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION
    };
    
    console.log('🔧 環境変数チェック:', envVars);
    return envVars;
  };

  const envVars = checkEnvVars();

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-sm">
      <h3 className="font-bold mb-2">🔧 認証デバッグ情報</h3>
      <div className="space-y-1">
        <div>
          <strong>User Pool ID:</strong> {envVars.NEXT_PUBLIC_USER_POOL_ID ? '✅ 設定済み' : '❌ 未設定'}
          {envVars.NEXT_PUBLIC_USER_POOL_ID && (
            <span className="text-gray-600 ml-2">({envVars.NEXT_PUBLIC_USER_POOL_ID})</span>
          )}
        </div>
        <div>
          <strong>Client ID:</strong> {envVars.NEXT_PUBLIC_USER_POOL_CLIENT_ID ? '✅ 設定済み' : '❌ 未設定'}
          {envVars.NEXT_PUBLIC_USER_POOL_CLIENT_ID && (
            <span className="text-gray-600 ml-2">({envVars.NEXT_PUBLIC_USER_POOL_CLIENT_ID})</span>
          )}
        </div>
        <div>
          <strong>Region:</strong> {envVars.NEXT_PUBLIC_AWS_REGION || 'ap-northeast-1（デフォルト）'}
        </div>
      </div>
      <div className="mt-2 text-gray-600">
        ブラウザの開発者ツールでコンソールログを確認してください。
      </div>
      <button
        onClick={() => runAuthDiagnostics()}
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
      >
        🔬 詳細診断実行
      </button>
    </div>
  );
};

export default AuthDebug;