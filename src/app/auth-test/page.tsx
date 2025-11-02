'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LambdaEdgeAuthDebug from '../../components/LambdaEdgeAuthDebug';
import LambdaEdgeAuthGuide from '../../components/LambdaEdgeAuthGuide';
import { getCurrentAuthUser, getAccessToken, getIdToken } from '../../lib/auth';

const AuthTestPage: React.FC = () => {
  const { user, isLoggedIn, loading, refreshUser } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<{
    accessToken: string | null;
    idToken: string | null;
    decodedAccessToken: Record<string, unknown> | null;
    decodedIdToken: Record<string, unknown> | null;
  }>({
    accessToken: null,
    idToken: null,
    decodedAccessToken: null,
    decodedIdToken: null
  });

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT デコードエラー:', error);
      return null;
    }
  };

  const loadTokenInfo = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      const idToken = await getIdToken();
      
      setTokenInfo({
        accessToken,
        idToken,
        decodedAccessToken: accessToken ? decodeJWT(accessToken) : null,
        decodedIdToken: idToken ? decodeJWT(idToken) : null
      });
    } catch (error) {
      console.error('トークン取得エラー:', error);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadTokenInfo();
    }
  }, [isLoggedIn, loadTokenInfo]);

  const testGetCurrentUser = async () => {
    try {
      const currentUser = await getCurrentAuthUser();
      console.log('getCurrentAuthUser結果:', currentUser);
      alert(`ユーザー取得成功:\n${JSON.stringify(currentUser, null, 2)}`);
    } catch (error) {
      console.error('getCurrentAuthUser エラー:', error);
      alert(`ユーザー取得失敗:\n${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-lg">認証状態を確認中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Lambda@Edge認証テストページ
          </h1>
          <p className="text-gray-600">
            Lambda@Edgeで認証されたユーザー情報の取得と表示をテストします
          </p>
        </div>

        {/* 認証状態サマリー */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📊 認証状態サマリー</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${loading ? 'bg-yellow-100' : isLoggedIn ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="text-lg font-medium">
                {loading ? '⏳' : isLoggedIn ? '✅' : '❌'} 認証状態
              </div>
              <div className="text-sm text-gray-600">
                {loading ? '確認中...' : isLoggedIn ? 'ログイン済み' : '未ログイン'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${user ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="text-lg font-medium">
                {user ? '✅' : '❌'} ユーザー情報
              </div>
              <div className="text-sm text-gray-600">
                {user ? `${user.username}` : '取得できません'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${tokenInfo.accessToken ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="text-lg font-medium">
                {tokenInfo.accessToken ? '✅' : '❌'} アクセストークン
              </div>
              <div className="text-sm text-gray-600">
                {tokenInfo.accessToken ? '取得済み' : '取得できません'}
              </div>
            </div>
          </div>
        </div>

        {/* ユーザー詳細情報 */}
        {isLoggedIn && user && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">👤 ユーザー詳細情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {user.username}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {user.email || 'N/A'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ユーザーID (sub)</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono">
                  {user.sub}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">属性情報</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs">
                  {user.attributes ? JSON.stringify(user.attributes, null, 2) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* トークン情報 */}
        {tokenInfo.accessToken && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎫 トークン情報</h2>
            <div className="space-y-4">
              
              {/* アクセストークン */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アクセストークン（デコード済み）
                </label>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-xs font-mono">
                  <pre>{JSON.stringify(tokenInfo.decodedAccessToken, null, 2)}</pre>
                </div>
              </div>

              {/* IDトークン */}
              {tokenInfo.decodedIdToken && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IDトークン（デコード済み）
                  </label>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto text-xs font-mono">
                    <pre>{JSON.stringify(tokenInfo.decodedIdToken, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* テストアクション */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 テストアクション</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={refreshUser}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              🔄 ユーザー情報を更新
            </button>
            
            <button
              onClick={testGetCurrentUser}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              👤 ユーザー取得テスト
            </button>
            
            <button
              onClick={loadTokenInfo}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              🎫 トークン情報を更新
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              🔄 ページを再読み込み
            </button>
          </div>
        </div>

        {/* デバッグパネル */}
        <LambdaEdgeAuthDebug />

        {/* 使用方法ガイド */}
        <LambdaEdgeAuthGuide />
      </div>
    </div>
  );
};

export default AuthTestPage;