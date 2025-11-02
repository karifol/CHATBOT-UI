'use client';
import Chat from "@/components/Chat";
import Sidebar from "@/components/Sidebar";
import { RequireAuth } from "@/components/AuthModal";
import { ChatMessage } from "@/lib/types";
import { useState, Suspense, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ChatTypePageContent = () => {
  const { user, loading, isLoggedIn } = useAuth();
  const now = Date.now();
  const nowStr = new Date(now).toLocaleString();
  
  // システムメッセージが初期化済みかのフラグ
  const [systemMessageInitialized, setSystemMessageInitialized] = useState(false);
  
  // ログインユーザー情報を含むシステムメッセージを生成
  const getSystemMessage = useCallback(() => {
    let message = `あなたは有能なアシスタントです。現在の日時は ${nowStr} です。`;
    
    if (isLoggedIn && user) {
      message += `\nログイン中のユーザー: ${user.username}`;
      if (user.email) {
        message += ` (${user.email})`;
      }
      message += `\nユーザーID: ${user.sub}`;
    } else if (!loading) {
      message += `\n現在、認証されていないユーザーです。`;
    }
    
    return message;
  }, [nowStr, isLoggedIn, user, loading]);
  
  // メッセージリスト
  // この内容がページに表示される
  const [MessageList, setMessageList] = useState<ChatMessage[]>([
    {
      user: "system",
      message: getSystemMessage(),
      tool_name: "",
      tool_input: "",
      tool_response: "",
      tool_id: ""
    },
  ]);

  // ユーザー情報の変更時にシステムメッセージを更新（初回のみ）
  useEffect(() => {
    if (!loading && !systemMessageInitialized) {
      setMessageList([{
        user: "system",
        message: getSystemMessage(),
        tool_name: "",
        tool_input: "",
        tool_response: "",
        tool_id: ""
      }]);
      setSystemMessageInitialized(true);
    }
  }, [user, isLoggedIn, loading, getSystemMessage, systemMessageInitialized]);

  return (
    <RequireAuth>
      <div className="flex h-full w-full">
          <div className="hidden lg:w-1/6 lg:block">
            <Sidebar/>
          </div>
          <main className="bg-white w-full lg:w-4/5">
            <div className="flex flex-col h-full w-full">
              <Chat
                messageList={MessageList}
                setMessageList={setMessageList}
              />
            </div>
          </main>
      </div>
    </RequireAuth>
  );
};

const ChatTypePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatTypePageContent />
    </Suspense>
  );
};

export default ChatTypePage