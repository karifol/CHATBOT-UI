'use client';
import { useState, useRef } from 'react';
import { Textarea } from "@/components/Textarea";
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/lib/types';
import { Send, Loader2 } from 'lucide-react';

const ChatForm = ({
  messageList, setMessageList, isLoading = false
}: {
  messageList: ChatMessage[];
  setMessageList: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isLoading?: boolean;
}) => {

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    // TextAreaの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.rows = 1;
      textareaRef.current.style.height = "";
    }

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
      }
    ];
    
    setMessageList(newMessageList);
  };

  return (
    <div className="p-3 w-full min-h-20">
      <div className="flex justify-between items-center gap-2 rounded-4xl p-2 border border-gray-300 shadow-sm">
        <Textarea
          ref={textareaRef}
          placeholder={isLoading ? "回答を生成中..." : "メッセージを入力して下さい..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          disabled={isLoading}
        />
        <Button
          type="button"
          className={`flex items-center h-[44px] min-h-[44px] px-4 rounded-full ${
            isLoading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gray-400 hover:bg-gray-500 hover:cursor-pointer'
          }`}
          style={{
            textShadow:
              "0 1px 4px rgba(0,0,0,0.25), 0 0px 1px rgba(0,0,0,0.15)"
          }}
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </Button>

      </div>
    </div>
  );
};

export default ChatForm;
