'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { runAuthDiagnostics } from '../lib/auth';

interface LambdaEdgeAuthDebugProps {
  className?: string;
}

export const LambdaEdgeAuthDebug: React.FC<LambdaEdgeAuthDebugProps> = ({ 
  className = '' 
}) => {
  const { user, loading, isLoggedIn, refreshUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Lambda@Edge認証デバッグコンポーネントが初期化されました');
    }
  }, []);

  const handleRunDiagnostics = async () => {
    setDebugInfo('診断実行中...');
    
    // コンソールに出力された診断情報をキャプチャするために
    // 一時的にconsole.logを上書き
    const originalConsoleLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalConsoleLog(...args);
    };
    
    try {
      await runAuthDiagnostics();
      setDebugInfo(logs.join('\n'));
    } finally {
      console.log = originalConsoleLog;
    }
  };

  const handleRefreshUser = async () => {
    await refreshUser();
  };

  const checkCookies = () => {
    const cookies = document.cookie;
    const cognitoCookies = cookies
      .split(';')
      .filter(cookie => cookie.includes('Cognito') || cookie.includes('amplify'))
      .join('\n');
    
    setDebugInfo(`Cognitoに関連するCookie:\n${cognitoCookies || 'なし'}`);
  };

  const checkLocalStorage = () => {
    const keys = Object.keys(localStorage);
    const cognitoKeys = keys.filter(key => 
      key.includes('amplify') || 
      key.includes('cognito') || 
      key.includes('Cognito') ||
      key.includes('aws')
    );
    
    const storageInfo = cognitoKeys
      .map(key => `${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`)
      .join('\n');
    
    setDebugInfo(`Cognitoに関連するLocalStorage:\n${storageInfo || 'なし'}`);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // 本番環境では表示しない
  }

  return (
    <div className={`p-4 bg-gray-100 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold mb-4">🔧 Lambda@Edge認証デバッグ</h3>
      
      <div className="space-y-4">
        {/* 現在の認証状態 */}
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium mb-2">📊 現在の認証状態</h4>
          <div className="text-sm space-y-1">
            <div>ロード中: {loading ? '✅' : '❌'}</div>
            <div>ログイン状態: {isLoggedIn ? '✅' : '❌'}</div>
            <div>ユーザー情報: {user ? '✅' : '❌'}</div>
            {user && (
              <div className="ml-4 text-gray-600">
                <div>ユーザー名: {user.username}</div>
                <div>メール: {user.email}</div>
                <div>User ID: {user.sub}</div>
              </div>
            )}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleRunDiagnostics}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            🔍 詳細診断実行
          </button>
          <button 
            onClick={handleRefreshUser}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            🔄 ユーザー情報更新
          </button>
          <button 
            onClick={checkCookies}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
          >
            🍪 Cookieチェック
          </button>
          <button 
            onClick={checkLocalStorage}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
          >
            💾 LocalStorageチェック
          </button>
        </div>

        {/* デバッグ情報表示 */}
        {debugInfo && (
          <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-64 overflow-auto">
            <pre>{debugInfo}</pre>
          </div>
        )}

        {/* 環境変数チェック */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
          <h4 className="font-medium mb-2">⚙️ 環境変数確認</h4>
          <div className="text-sm space-y-1">
            <div>User Pool ID: {process.env.NEXT_PUBLIC_USER_POOL_ID || '❌ 未設定'}</div>
            <div>Client ID: {process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '❌ 未設定'}</div>
            <div>Region: {process.env.NEXT_PUBLIC_AWS_REGION || '❌ 未設定'}</div>
            <div>Domain: {process.env.NEXT_PUBLIC_USER_POOL_DOMAIN || '❌ 未設定'}</div>
          </div>
        </div>

        {/* Lambda@Edge設定情報 */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
          <h4 className="font-medium mb-2">🌐 Lambda@Edge設定</h4>
          <div className="text-sm space-y-1">
            <div>User Pool ID: ap-northeast-1_zmRWDqupw</div>
            <div>Client ID: 4hevv56m24aut5499jrcgufto0</div>
            <div>Domain: ap-northeast-1zmrwdqupw.auth.ap-northeast-1.amazoncognito.com</div>
            <div>Parse Auth Path: /chatbot/index.html</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LambdaEdgeAuthDebug;