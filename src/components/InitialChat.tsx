import React from 'react'
import TitleLogo from '@/components/TitleLogo'
import ChatForm from '@/components/ChatForm'
import ChatSuggest from '@/components/ChatSuggest'
import { ChatMessage, ResponseMessage } from '@/lib/types'
import { callChatApiStream, updateMessageListWithAIResponse } from '@/lib/chatApi'

const InitialChat = (
  { messageList, setMessageList }:
  {
    messageList: ChatMessage[];
    setMessageList: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  }
) => {

  // サジェストクリック時のAPI呼び出し
  const handleSuggestClick = async (text: string) => {

    // ユーザーメッセージを追加
    const newMessageList: ChatMessage[] = [
      ...messageList,
      {
        user: "user" as const,
        message: text,
        tool_name: "",
        tool_input: "",
        tool_response: "",
        tool_id: ""
      },
      {
        user: "assistant" as const,
        message: "",
        tool_name: "",
        tool_input: "",
        tool_response: "",
        tool_id: ""
      }
    ];
    
    setMessageList(newMessageList);

    // チャットAPIを呼び出す
    const messages = [];
    for (const msg of newMessageList) {
      if (msg.user !== "user" && msg.user !== "assistant" && msg.user !== "system") {
        continue;
      }
      messages.push({
        role: msg.user,
        content: msg.message
      });
    }

    const responseList: ResponseMessage[] = [];
    await callChatApiStream(messages, (event) => {
      responseList.push(event);
      const updatedList = updateMessageListWithAIResponse(newMessageList, responseList);
      setMessageList(updatedList);
    });
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative h-full w-full flex justify-center items-center bg-white">
        <div className="w-150">
          <TitleLogo />
          <ChatForm
            messageList={messageList}
            setMessageList={setMessageList}
          />
          <ChatSuggest onSuggestClick={handleSuggestClick} />
        </div>
      </div>
    </div>
  )
}

export default InitialChat