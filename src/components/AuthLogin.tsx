'use client';

import React, { useState } from 'react';
import { signIn, signOut } from '@aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';

export const AuthLogin: React.FC = () => {
  const { user, isLoggedIn, loading, refreshUser } = useAuth();
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    try {
      console.log('🔐 ログイン試行中...', { username: loginForm.username });
      
      const signInResult = await signIn({
        username: loginForm.username,
        password: loginForm.password
      });
      
      console.log('✅ ログイン結果:', signInResult);
      
      // ログイン成功後、ユーザー情報を更新
      await refreshUser();
      
    } catch (error: unknown) {
      console.error('❌ ログインエラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
      setError(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('👋 ログアウト中...');
      await signOut();
      console.log('✅ ログアウト完了');
      await refreshUser();
    } catch (error: unknown) {
      console.error('❌ ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-100 p-4 rounded-lg mb-4">
        <div className="text-blue-800">🔄 認証状態を確認中...</div>
      </div>
    );
  }

  if (isLoggedIn && user) {
    return (
      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <div className="text-green-800">
          <h3 className="font-bold mb-2">✅ ログイン中</h3>
          <div>ユーザー名: {user.username}</div>
          <div>Email: {user.email || '未設定'}</div>
          <div>User ID: {user.sub}</div>
          <button 
            onClick={handleLogout}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold mb-2 text-yellow-800">🔐 ログインが必要です</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3">
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名またはEmail
          </label>
          <input
            type="text"
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
            disabled={isLoggingIn}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
            disabled={isLoggingIn}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoggingIn ? '🔄 ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );
};

export default AuthLogin;