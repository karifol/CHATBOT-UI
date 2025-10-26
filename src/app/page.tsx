'use client';
import Chat from "@/components/Chat";
import Sidebar from "@/components/Sidebar";
import { ChatMessage } from "@/lib/types";
import { useState } from "react";

const ChatTypePage = () => {
  const now = Date.now();
  const nowStr = new Date(now).toLocaleString();

  // メッセージリスト
  // この内容がページに表示される
  const [MessageList, setMessageList] = useState<ChatMessage[]>([
    {
      user: "system",
      message: `あなたは有能なアシスタントです。現在の日時は ${nowStr} です。`,
      tool_name: "",
      tool_input: "",
      tool_response: "",
      tool_id: ""
    },
  ]);

  return (
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

  )
}

export default ChatTypePage