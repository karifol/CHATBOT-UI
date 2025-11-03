/**
 * チャット中のメインコンポーネント
 * チャットメッセージの表示と入力フォームを含む
 */
'use client';
import { useRef, useEffect } from "react";
import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";
import LoadingIndicator from "@/components/LoadingIndicator";
import { ChatMessage as ChatMessageType } from "@/lib/types";

const Chat = (
  { messageList, setMessageList, isLoading }:
  {
    messageList: ChatMessageType[];
    setMessageList: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    isLoading: boolean;
  }
) => {

  // スクロール用ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messageList]);

  // tool_start, tool_endがある場合はtool_idをもとに統合する
  const newMessageList: ChatMessageType[] = [];
  newMessageList.push(messageList[0]); // systemメッセージはそのまま追加

  // tool_idをキーにしたマップ（newMessageListのindex）
  const toolMessageMap: { [key: string]: number } = {};

  for (let i = 1; i < messageList.length; i++) {
    const msg = messageList[i];
    if (msg.user === "tool_start") {
      const tool_id = msg.tool_id;
      toolMessageMap[tool_id] = newMessageList.length;
      newMessageList.push(msg);
    } else if (msg.user === "tool_end") {
      const tool_id = msg.tool_id;
      const startIndex = toolMessageMap[tool_id];
      if (startIndex !== undefined) {
        newMessageList[startIndex] = {
          ...newMessageList[startIndex],
          tool_response: msg.tool_response,
        };
      }
      // tool_end自体はnewMessageListに追加しない
    } else {
      newMessageList.push(msg);
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative h-full flex justify-center">
        {/* チャット内容エリア */}
        <div
          className="pb-20 p-4 overflow-auto h-[calc(100vh-5rem)] w-250"
          ref={messagesEndRef}
        >
          {/* チャットメッセージ一覧 */}
          {newMessageList.map((item, index) => (
            <ChatMessage
              key={index}
              message={item.message}
              user={item.user}
              tool_name={item.tool_name}
              tool_input={item.tool_input}
              tool_response={item.tool_response}
            />
          ))}
          {/* ローディング表示 */}
          {isLoading && <LoadingIndicator />}
        </div>
        {/* フォームを下部中央に固定 */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white w-full max-w-250">
          <ChatForm
            messageList={newMessageList}
            setMessageList={setMessageList}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
