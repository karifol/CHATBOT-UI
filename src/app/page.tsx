/**
 * チャットページのメインコンポーネント
 * layout.tsxでラップされた状態で最初に表示されるコンポーネント
 */

'use client';
import Chat from "@/components/Chat";
import InitialChat from "@/components/InitialChat";
import Sidebar from "@/components/Sidebar";
import { RequireAuth } from "@/components/AuthModal";
import { ChatMessage, ResponseMessage } from "@/lib/types";
import { useState, Suspense, useCallback, useRef } from "react";
import { callChatApiStream, updateMessageListWithAIResponse, getSessionMessages } from "@/lib/chatApi";
import { useAuth } from "@/contexts/AuthContext";
import { generateUniqueSessionId } from "@/lib/utils";

const ChatTypePageContent = () => {
  const { user } = useAuth();
  const now = Date.now();
  const nowStr = new Date(now).toLocaleString();
  
  // ユーザーIDを取得（メールアドレスの@前半部分）
  const getUserId = useCallback(() => {
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix || 'guest';
    }
    return 'guest';
  }, [user]);
  
  // 固定のシステムメッセージを生成
  const getSystemMessage = useCallback(() => {
    return `あなたは有能なアシスタントです。現在の日時は ${nowStr} です。`;
  }, [nowStr]);
  
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
  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // API処理中フラグ
  const isProcessingRef = useRef(false);

  // 現在のセッションID
  const [currentSessionId, setCurrentSessionId] = useState<string>("");

  /**
   * APIを呼び出す関数
   * @param newMessageList 
   * @returns 
   */
  const callChatApi = async (newMessageList: ChatMessage[]) => {
    if (isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsLoading(true);
    
    try {
      const messages = [];
      for (const msg of newMessageList) {
        if (msg.user === "user" || msg.user === "assistant" || msg.user === "system") {
          messages.push({
            role: msg.user,
            content: msg.message
          });
        }
      }

      const userId = getUserId();
      
      // 新規セッションの場合、新しいセッションIDを生成
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await generateUniqueSessionId(userId);
        setCurrentSessionId(sessionId);
        console.log("新しいユニークなセッションIDを生成しました:", sessionId);
      }
      
      const responseList: ResponseMessage[] = [];
      let hasFirstResponse = false;
      
      await callChatApiStream(
        userId,
        sessionId,
        messages,
        (event: ResponseMessage) => {
          responseList.push(event);
          
          // 最初のレスポンスが来たらローディングを停止
          if (!hasFirstResponse && responseList.length === 1) {
            hasFirstResponse = true;
            setIsLoading(false);
          }
          
          // ストリーミング中は累積されたレスポンス全体でメッセージリストを更新
          // 元のメッセージリストを基準にして更新
          setMessageList(() => {
            return updateMessageListWithAIResponse(newMessageList, responseList);
          });
        }
      );
    } catch (error) {
      console.error("API呼び出しエラー:", error);
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };

  /**
   * セッションを選択したときの処理
   * @param sessionId 選択されたセッションID
   */
  const handleSessionSelect = async (sessionId: string) => {
    // 処理中の場合は処理をキャンセル
    if (isProcessingRef.current) {
      return;
    }

    try {
      setIsLoading(true);
      const sessionMessages = await getSessionMessages(getUserId(), sessionId);
      
      if (sessionMessages.length > 0) {
        setMessageList(sessionMessages);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error("セッションの読み込みに失敗しました:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 新しいチャットを開始する処理
   */
  const handleNewChat = () => {
    // 処理中のAPIコールがあれば停止
    isProcessingRef.current = false;
    setIsLoading(false);
    
    setMessageList([
      {
        user: "system",
        message: getSystemMessage(),
        tool_name: "",
        tool_input: "",
        tool_response: "",
        tool_id: ""
      }
    ]);
    setCurrentSessionId("");
  };

  // システムメッセージのみの場合（チャットが開始されていない場合）はInitialChatを表示
  const isInitialState = MessageList.length === 1 && MessageList[0].user === "system";

  return (
    <RequireAuth>
      <div className="flex h-full w-full">
          <div className="hidden lg:w-1/6 lg:block">
            <Sidebar 
              onSessionSelect={handleSessionSelect}
              onNewChat={handleNewChat}
            />
          </div>
          <main className="bg-white w-full lg:w-4/5">
            <div className="flex flex-col h-full w-full">
              {isInitialState ? (
                <InitialChat
                  messageList={MessageList}
                  setMessageList={setMessageList}
                  isLoading={isLoading}
                  onSendMessage={callChatApi}
                />
              ) : (
                <Chat
                  messageList={MessageList}
                  setMessageList={setMessageList}
                  isLoading={isLoading}
                  onSendMessage={callChatApi}
                />
              )}
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