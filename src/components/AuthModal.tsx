'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  closeable?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  closeable = true 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { refreshUser } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthSuccess = async () => {
    setIsAuthenticating(true);
    try {
      // ユーザー情報を更新
      await refreshUser();
      // モーダルを閉じる
      onClose();
    } catch (error) {
      console.error('認証後の更新エラー:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isOpen) return null;

  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
          <AiOutlineLoading3Quarters className="animate-spin mx-auto mb-4 text-blue-500" size={32} />
          <p className="text-gray-600">認証情報を更新中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {mode === 'login' ? 'ログイン' : '新規登録'}
          </h2>
          {closeable && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* コンテンツ */}
        <div className="p-4">
          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => setMode('signup')}
            />
          ) : (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// 認証が必要なページをラップするコンポーネント
interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  fallback 
}) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="animate-spin mx-auto mb-4 text-blue-500" size={32} />
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // 直接ログインモーダルを表示（閉じられない）
    return (
      <AuthModal
        isOpen={true}
        onClose={() => {}} // 空の関数
        initialMode="login"
        closeable={false} // 閉じるボタンを非表示
      />
    );
  }

  return <>{children}</>;
};

export default AuthModal;