// チャットメッセージ
export interface ChatMessage {
  chart?: string | object;
  user: "assistant" | "user" | "system" | "tool_start" | "tool_end" | "chart";
  message: string;
  loading?: boolean;
  tool_name: string;
  tool_input: string;
  tool_response: string;
  tool_id: string;
}

// chatbotから返ってくるメッセージの型
export interface ResponseMessage {
  type: "AIMessageChunk" | "ToolMessage";
  content?: string;
  tool_name?: string;
  tool_input?: string;
  tool_response?: string;
  tool_id?: string;
  is_start?: boolean;
  is_end?: boolean;
}

// チャット履歴アイテム
export interface ChatHistoryItem {
  session_id: string;
  uid: string;
  sessions: ChatHistorySession[];
}

export interface ChatHistorySession {
  last_updated: string;
  session_id: string;
  uid: string;
  messages: ChatHistoryMessage[];
}

export interface ChatHistoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}