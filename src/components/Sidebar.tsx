import React, { useState, useEffect, useCallback } from "react";
import { SlNote } from "react-icons/sl";
import { FiSidebar } from "react-icons/fi";
import { BsChatDots } from "react-icons/bs";
import { ChatHistorySession } from "@/lib/types";
import { getChatHistory } from "@/lib/chatApi";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  onSessionSelect?: (sessionId: string) => void;
  onNewChat?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSessionSelect, onNewChat }) => {
  const [isClosed, setIsClosed] = useState(false); // サイドバーの開閉状態
  const [chatHistory, setChatHistory] = useState<ChatHistorySession[]>([]); // チャット履歴
  const [isLoading, setIsLoading] = useState(false); // 履歴読み込み中フラグ
  const { user } = useAuth();

  // ユーザーIDを取得（メールアドレスの@前半部分）
  const getUserId = useCallback(() => {
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix || 'guest';
    }
    return 'guest';
  }, [user?.email]);

  // サイドバーの開閉を切り替える関数
  const toggleSidebar = () => {
    setIsClosed(!isClosed);
  };

  // チャット履歴を取得
  const loadChatHistory = useCallback(async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    try {
      const historyItems = await getChatHistory(getUserId());
      setChatHistory(historyItems);
    } catch (error) {
      console.error("チャット履歴の取得に失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, getUserId]);

  // コンポーネントマウント時とユーザー変更時にチャット履歴を取得
  useEffect(() => {
    if (user?.email) {
      loadChatHistory();
    }
  }, [user?.email, loadChatHistory]);

  // チャット履歴アイテムをクリックしたときの処理
  const handleHistoryItemClick = (sessionId: string) => {
    if (onSessionSelect) {
      onSessionSelect(sessionId);
    }
  };

  return (
    <div className={`space-y-5 p-5 h-screen flex flex-col bg-gray-100 transition-all duration-300 ${
      isClosed ? 'w-16' : 'w-64'
    }`}>
      {/* ヘッダー */}
      <div className={`flex items-center align-middle p-3 h-5 ${
        isClosed ? 'justify-center' : 'justify-end mr-5'
      }`}>
        {/* 折りたたみボタン */}
        <button
          onClick={toggleSidebar}
          className="text-gray-600 h-5 flex justify-center align-middle hover:text-gray-800 cursor-pointer transition-colors duration-200"
        >
          <FiSidebar
            className="w-5 h-5"
          />
        </button>
      </div>
      
      {!isClosed && (
        <>
          {/* チャットを新規作成 */}
          <button
            className="flex items-center cursor-pointer w-50 hover:bg-gray-200 rounded p-2 text-sm"
            onClick={() => onNewChat ? onNewChat() : window.location.reload()}
            type="button"
          >
            <SlNote className="inline-block mr-2"/>
            チャットをリセット
          </button>

          {/* チャット履歴セクション */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <h3 className="text-sm font-medium text-gray-700 mb-3">チャット履歴</h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="text-sm text-gray-500">読み込み中...</div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4">
                    履歴はありません
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatHistory.map((session) => {
                      // セッションのタイトルを生成（最初のユーザーメッセージから）
                      const firstUserMessage = session.messages.find(msg => msg.role === 'user');
                      const title = firstUserMessage?.content
                        ? (firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : ''))
                        : 'チャット';
                      
                      // 最後のメッセージを取得
                      const lastMessage = session.messages[session.messages.length - 1];
                      const lastMessagePreview = lastMessage.content
                        ? (lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : ''))
                        : '';
                      
                      return (
                        <button
                          key={session.session_id}
                          onClick={() => handleHistoryItemClick(session.session_id)}
                          className="w-full text-left p-2 hover:bg-gray-200 rounded text-sm transition-colors duration-200"
                        >
                          <div className="flex items-start">
                            <BsChatDots className="mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-800 truncate">
                                {title}
                              </div>
                              <div className="text-gray-500 text-xs truncate mt-1">
                                {lastMessagePreview}
                              </div>
                              <div className="text-gray-400 text-xs mt-1">
                                {new Date(session.last_updated).toLocaleDateString('ja-JP')}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Sidebar