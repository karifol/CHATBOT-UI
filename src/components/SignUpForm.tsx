'use client';

import React, { useState } from 'react';
import { registerUser, confirmUserRegistration, resendConfirmationCode, type SignUpParams, type ConfirmSignUpParams } from '../lib/auth';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLoading3Quarters, AiOutlineCheckCircle } from 'react-icons/ai';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

type SignUpStep = 'register' | 'confirm';

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [step, setStep] = useState<SignUpStep>('register');
  const [formData, setFormData] = useState<SignUpParams>({
    username: '',
    email: '',
    password: ''
  });
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        if (result.isComplete) {
          setSuccess('アカウントが作成されました！');
          onSuccess?.();
        } else {
          setSuccess('確認コードを送信しました。メールをご確認ください。');
          setStep('confirm');
        }
      } else {
        setError(result.message || 'ユーザー登録に失敗しました');
      }
    } catch (error) {
      console.error('登録エラー:', error);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const confirmParams: ConfirmSignUpParams = {
        username: formData.username,
        confirmationCode
      };

      const result = await confirmUserRegistration(confirmParams);
      
      if (result.success && result.isComplete) {
        setSuccess('アカウントが確認されました！ログインしてください。');
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setError(result.message || 'アカウント確認に失敗しました');
      }
    } catch (error) {
      console.error('確認エラー:', error);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await resendConfirmationCode(formData.username);
      
      if (result.success) {
        setSuccess('確認コードを再送信しました。');
      } else {
        setError(result.message || '確認コードの再送信に失敗しました');
      }
    } catch (error) {
      console.error('再送信エラー:', error);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'confirmationCode') {
      setConfirmationCode(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // エラーをクリア
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  if (step === 'confirm') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">アカウント確認</h2>
          <p className="text-gray-600">
            {formData.email} に送信された確認コードを入力してください
          </p>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          {/* 確認コード */}
          <div>
            <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-1">
              確認コード
            </label>
            <input
              type="text"
              id="confirmationCode"
              name="confirmationCode"
              value={confirmationCode}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              disabled={loading}
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 成功メッセージ */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <AiOutlineCheckCircle className="text-green-500 mr-2" size={16} />
                <div className="text-sm text-green-700">{success}</div>
              </div>
            </div>
          )}

          {/* 確認ボタン */}
          <button
            type="submit"
            disabled={loading || !confirmationCode}
            className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <AiOutlineLoading3Quarters className="animate-spin mr-2" size={16} />
                確認中...
              </>
            ) : (
              'アカウントを確認'
            )}
          </button>

          {/* 再送信ボタン */}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading}
            className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            確認コードを再送信
          </button>
        </form>

        {/* 戻るボタン */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setStep('register')}
            className="text-sm text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            ← 登録画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">新規登録</h2>
        <p className="text-gray-600">新しいアカウントを作成してください</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* ユーザー名 */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ユーザー名を入力"
            disabled={loading}
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="メールアドレスを入力"
            disabled={loading}
          />
        </div>

        {/* パスワード */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="パスワードを入力（8文字以上）"
              minLength={8}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            大文字、小文字、数字を含む8文字以上で入力してください
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* 成功メッセージ */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <AiOutlineCheckCircle className="text-green-500 mr-2" size={16} />
              <div className="text-sm text-green-700">{success}</div>
            </div>
          </div>
        )}

        {/* 登録ボタン */}
        <button
          type="submit"
          disabled={loading || !formData.username || !formData.email || !formData.password}
          className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <AiOutlineLoading3Quarters className="animate-spin mr-2" size={16} />
              登録中...
            </>
          ) : (
            'アカウントを作成'
          )}
        </button>
      </form>

      {/* ログインリンク */}
      {onSwitchToLogin && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちの方は{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-800 font-medium"
              disabled={loading}
            >
              ログイン
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;