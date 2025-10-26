'use client';
import { useState, useRef } from 'react';
import { Textarea } from "@/components/Textarea";
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/lib/types';
import { callChatApiStream, updateMessageListWithAIResponse, StreamEvent } from '@/lib/chatApi';
import { LoaderCircle, Send } from 'lucide-react';

const ChatForm = ({
  messageList, setMessageList
}: {
  messageList: ChatMessage[];
  setMessageList: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}) => {

  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (isSubmitting) return;
    const text = input.trim();
    if (!text) return;

    setIsSubmitting(true);
    setInput("");
    // TextAreaの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.rows = 1;
      textareaRef.current.style.height = "";
    }

    // ユーザーメッセージを追加
    // ページが更新される
    setMessageList(prev => [
      ...prev,
      {
        user: "user",
        message: text,
        tool_name: "",
        tool_input: "",
        tool_response: "",
        tool_id: ""
      },
      {
        user: "assistant",
        message: "",
        tool_name: "",
        tool_input: "",
        tool_response: "",
        tool_id: ""
      }
    ]);
    messageList.push({
      user: "user",
      message: text,
      tool_name: "",
      tool_input: "",
      tool_response: "",
      tool_id: ""
    });

    // チャットAPIを呼び出す
    const messages = [];
    for (const msg of messageList) {
      if (msg.user !== "user" && msg.user !== "assistant" && msg.user !== "system") {
        continue;
      }
      messages.push({
        role: msg.user,
        content: msg.message
      });
    }

    const responseList: StreamEvent[] = [];
    await callChatApiStream(messages, (event) => {
      responseList.push(event);
      const newList = updateMessageListWithAIResponse(messageList, responseList);
      setMessageList(newList);
    });
    setIsSubmitting(false);
  };

  return (
    <div className="p-3 w-full min-h-20">
      <div className="flex justify-between items-center gap-2 rounded-4xl p-2 border border-gray-300 shadow-sm">
        <Textarea
          ref={textareaRef}
          placeholder="メッセージを入力して下さい..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSubmitting}
          rows={1}
        />
        <Button
          type="button"
          className="flex items-center bg-gray-400 hover:bg-gray-500 h-[44px] min-h-[44px] px-4 hover:cursor-pointer rounded-full"
          style={{
            textShadow:
              "0 1px 4px rgba(0,0,0,0.25), 0 0px 1px rgba(0,0,0,0.15)"
          }}
          onClick={handleSend}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </Button>

      </div>
    </div>
  );
};

export default ChatForm;
