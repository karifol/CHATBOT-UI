'use client';

import { AiOutlineQuestionCircle, AiOutlineClose, AiOutlineLogout, AiOutlineUser } from "react-icons/ai";
import { useState } from "react";
import { APP_CONFIG } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { logoutUser } from "../lib/auth";
import AuthModal from "./AuthModal";

const Header = () => {
  const { user, isLoggedIn, refreshUser } = useAuth();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleHelpModal = () => {
    setIsHelpModalOpen(!isHelpModalOpen);
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        await refreshUser();
      } else {
        console.error('ログアウトエラー:', result.message);
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  return (
    <>
      <div className="h-10 flex justify-between items-center px-4 text-xl">
        <div>{APP_CONFIG.TITLE}</div>
        
        {/* 右側のボタンエリア */}
        <div className="flex items-center space-x-3">
          {/* ユーザー情報とログアウトボタン（ログイン中のみ表示） */}
          {isLoggedIn && user ? (
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1 text-gray-700 max-w-32 sm:max-w-48">
                <AiOutlineUser className="w-4 h-4 flex-shrink-0" />
                <span className="truncate" title={user.email}>
                  {user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors duration-200 flex-shrink-0"
                title="ログアウト"
              >
                <AiOutlineLogout className="w-4 h-4" />
                <span className="hidden sm:inline">ログアウト</span>
              </button>
            </div>
          ): (
            <></>
          )}
          
          {/* 説明ボタン */}
          <AiOutlineQuestionCircle
            className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors duration-200"
            onClick={toggleHelpModal}
          />
        </div>
      </div>

      {/* ヘルプモーダル */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{APP_CONFIG.TITLE}</h2>
              <AiOutlineClose
                className="w-6 h-6 cursor-pointer hover:text-gray-600 transition-colors duration-200"
                onClick={toggleHelpModal}
              />
            </div>

            <div className="space-y-4 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold mb-2">基本的な使い方</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>画面下部のテキストボックスに質問や指示を入力してください</li>
                  <li>送信ボタンをクリックすることでメッセージを送信できます</li>
                  <li>AIが回答を生成してチャット画面に表示されます</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">主な機能</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>SS1:</strong> 1kmメッシュのピンポイント天気情報を提供します</li>
                  <li><strong>最新のPM Daily Report:</strong> 最新のPM Daily Reportを読み込んで回答します</li>
                  <li><strong>過去のPM Daily Report:</strong> 過去のPM Daily Reportを読み込んで回答します</li>
                  <li><strong>過去のPM Daily Report検索:</strong> 過去のPM Daily Reportの内容から検索して回答します</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">注意事項</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>AIは必ずしも正確な情報を提供するわけではありません</li>
                  <li>生成された内容をコンテンツとして使用する際は必ず内容の確認やダブルチェックを行ってください</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* 認証モーダル */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  )
}

export default Header
