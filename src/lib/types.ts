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

// ストリームイベント
export type StreamEvent =
  | { type: "token"; content: string }
  | {
    tool_response: string;
    type: "tool_start";
    tool_name: string;
    tool_input: string;
    tool_id: string;
  }
  | {
    type: "tool_end";
    tool_name: string;
    tool_response: string;
    tool_id: string;
  }
