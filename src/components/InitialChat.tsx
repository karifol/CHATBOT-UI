/**
 * 初期チャットコンポーネント
 * チャットが開始されていない状態で表示される
 */

'use client';
import React from 'react'
import TitleLogo from '@/components/TitleLogo'
import ChatForm from '@/components/ChatForm'
import ChatSuggest from '@/components/ChatSuggest'
import { ChatMessage } from '@/lib/types'

const InitialChat = (
  { messageList, setMessageList, isLoading, onSendMessage }:
  {
    messageList: ChatMessage[];
    setMessageList: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    isLoading: boolean;
    onSendMessage: (newMessageList: ChatMessage[]) => Promise<void>;
  }
) => {

  // サジェストクリック時のメッセージ追加
  const handleSuggestClick = async (text: string) => {
    // ユーザーメッセージを追加
    const newMessageList: ChatMessage[] = [
      ...messageList,
      {
        user: "user",
        message: text,
        tool_name: "",
        tool_input: "",
        tool_response: "",
        tool_id: ""
      }
    ];
    console.log("サジェストクリックで追加するメッセージ:", newMessageList);
    
    // まず状態を更新してユーザーメッセージを表示
    setMessageList(newMessageList);
    
    // その後API呼び出し
    await onSendMessage(newMessageList);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative h-full w-full flex justify-center items-center bg-white">
        <div className="w-150">
          <TitleLogo />
          <ChatForm
            messageList={messageList}
            setMessageList={setMessageList}
            isLoading={isLoading}
            onSendMessage={onSendMessage}
          />
          <ChatSuggest onSuggestClick={handleSuggestClick} />
        </div>
      </div>
    </div>
  )
}

export default InitialChat