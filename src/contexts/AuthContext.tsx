'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentAuthUser, isAuthenticated, type CurrentUser } from '../lib/auth';
import { Hub } from 'aws-amplify/utils';

// AuthContextの型定義
interface AuthContextType {
  user: CurrentUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
}

// デフォルト値
const defaultValue: AuthContextType = {
  user: null,
  loading: true,
  isLoggedIn: false,
  refreshUser: async () => {}
};

// Contextの作成
const AuthContext = createContext<AuthContextType>(defaultValue);

// AuthProviderのProps型
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider コンポーネント
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ユーザー情報を取得・更新する関数
  const refreshUser = async () => {
    try {
      setLoading(true);
      
      // 認証状態を確認
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        // ログイン中の場合はユーザー情報を取得
        const currentUser = await getCurrentAuthUser();
        setUser(currentUser);
      } else {
        // 未ログインの場合はユーザー情報をクリア
        setUser(null);
      }
    } catch (error) {
      console.error('💥 ユーザー情報の取得に失敗しました:', error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // コンポーネントマウント時にユーザー情報を取得
  useEffect(() => {
    // Amplify設定の完了を少し待ってから認証チェック
    const timer = setTimeout(() => {
      refreshUser();
    }, 100);

    // 認証イベントをリッスン
    const unsubscribe = Hub.listen('auth', (data) => {
      console.log('🎧 認証イベントを受信:', data);
      const { event } = data.payload;
      
      switch (event) {
        case 'signedIn':
          console.log('✅ サインイン完了');
          refreshUser();
          break;
        case 'signedOut':
          console.log('👋 サインアウト完了');
          setUser(null);
          setIsLoggedIn(false);
          setLoading(false);
          break;
        case 'tokenRefresh':
          console.log('🔄 トークン更新');
          refreshUser();
          break;
        default:
          console.log('📋 その他の認証イベント:', event);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const contextValue: AuthContextType = {
    user,
    loading,
    isLoggedIn,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// AuthContextを使用するためのカスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};