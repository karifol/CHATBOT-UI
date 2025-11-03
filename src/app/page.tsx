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
import { useState, Suspense, useCallback, useEffect, useRef } from "react";
import { callChatApiStream, updateMessageListWithAIResponse } from "@/lib/chatApi";

const ChatTypePageContent = () => {
  const now = Date.now();
  const nowStr = new Date(now).toLocaleString();
  
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

  // MessageListが更新されて、最後のメッセージがuserの場合にAPIを呼び出す
  useEffect(() => {
    const lastMessage = MessageList[MessageList.length - 1];
    
    // 最後のメッセージがユーザーメッセージで、かつ処理中でない場合
    if (lastMessage?.user === "user" && !isProcessingRef.current) {
      isProcessingRef.current = true;
      setIsLoading(true);
      
      // チャットAPIを呼び出す
      const callApi = async () => {
        const messages = [];
        for (const msg of MessageList) {
          if (msg.user === "user" || msg.user === "assistant" || msg.user === "system") {
            messages.push({
              role: msg.user,
              content: msg.message
            });
          }
        }

        const responseList: ResponseMessage[] = [];
        
        await callChatApiStream(
          "test-uid",
          "test-session",
          messages,
          (event: ResponseMessage) => {
            responseList.push(event);
            
            // 最初のレスポンスが来たらローディングを停止
            if (responseList.length === 1) {
              setIsLoading(false);
            }
            
            const updatedList = updateMessageListWithAIResponse(MessageList, responseList);
            setMessageList(updatedList);
          }
        );
        
        // ストリーミング完了時の処理
        isProcessingRef.current = false;
        setIsLoading(false);
      };

      callApi().catch((error) => {
        console.error("API呼び出しエラー:", error);
        isProcessingRef.current = false;
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [MessageList]);

  // システムメッセージのみの場合（チャットが開始されていない場合）はInitialChatを表示
  const isInitialState = MessageList.length === 1 && MessageList[0].user === "system";

  return (
    <RequireAuth>
      <div className="flex h-full w-full">
          <div className="hidden lg:w-1/6 lg:block">
            <Sidebar/>
          </div>
          <main className="bg-white w-full lg:w-4/5">
            <div className="flex flex-col h-full w-full">
              {isInitialState ? (
                <InitialChat
                  messageList={MessageList}
                  setMessageList={setMessageList}
                  isLoading={isLoading}
                />
              ) : (
                <Chat
                  messageList={MessageList}
                  setMessageList={setMessageList}
                  isLoading={isLoading}
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