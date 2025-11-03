import { ChatMessage, ResponseMessage, ChatHistorySession } from "@/lib/types";
import { APP_CONFIG } from "./constants";

/**
 * ストリーミングでチャットAPIを呼び出す
 * @param message ユーザーからの入力
 * @param onEvent サーバーから届いたイベントごとに呼ばれるコールバック
 */
export async function callChatApiStream(
  uid: string, // ユーザーID
  session_id: string, // セッションID
  messages: { role: string; content: string }[], // メッセージ履歴
  onEvent: (event: ResponseMessage) => void
) {

  console.log("callChatApiStream called with messages:", messages);

  const response = await fetch(APP_CONFIG.CHAT_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages , uid, session_id }),
  });

  if (!response.body) {
    throw new Error("レスポンスに body がありません");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = ""; // 追加: 途中データを保持するバッファ

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    // 最後の行が未完了の場合はバッファに残す
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.replace("data: ", ""));
          onEvent(data);
        } catch (err) {
          console.error("JSON parse error:", err, line);
        }
      }
    }
  }
}

/**
 * APIのレスポンス形式からChatMessage形式に変換する
 * @param messageList 
 * @returns 
 */
export function convertFormat(
  messageList: ResponseMessage[]
): ChatMessage[] {
  const chatMessages: ChatMessage[] = messageList.map((msg) => ({
    user: msg.type === "AIMessageChunk" ? "assistant" : "user",
    message: msg.content || "",
    tool_name: msg.tool_name || "",
    tool_input: msg.tool_input || "",
    tool_response: msg.tool_response || "",
    tool_id: msg.tool_id || ""
  }));
  return chatMessages;
}

// 生成AIからのメッセージを使ってmessageListを更新する
export function updateMessageListWithAIResponse(
  messageList: ChatMessage[],
  responseList: ResponseMessage[]
): ChatMessage[] {
  // メッセージリストをコピー
  let baseList = [...messageList];
  
  // 最後のメッセージから連続するassistantメッセージとtoolメッセージを除外
  while (baseList.length > 0) {
    const lastMessage = baseList[baseList.length - 1];
    if (lastMessage.user === "assistant" || 
        lastMessage.user === "tool_start" || 
        lastMessage.user === "tool_end") {
      baseList = baseList.slice(0, -1);
    } else {
      break;
    }
  }

  const newList = [...baseList];
  
  // AIメッセージの内容を累積
  let assistantMessageContent = "";
  const toolMessages: { [key: string]: ChatMessage } = {};

  // レスポンスリストを順番に処理してAIメッセージとツールメッセージを構築
  for (const responseMessage of responseList) {
    // ----------------------------
    // AIからのメッセージ
    // ----------------------------
    if (responseMessage.type === "AIMessageChunk" && responseMessage.content) {
      assistantMessageContent += responseMessage.content;
    }

    // ----------------------------
    // ツール開始
    // ----------------------------
    else if (responseMessage.type === "ToolMessage" && responseMessage.is_start) {
      const toolId = responseMessage.tool_id || "";
      if (!toolMessages[toolId]) {
        toolMessages[toolId] = {
          user: "tool_start",
          message: `ツール ${responseMessage.tool_name} を実行中...`,
          tool_name: responseMessage.tool_name || "",
          tool_input: responseMessage.tool_input || "",
          tool_response: "",
          tool_id: toolId
        };
      }
    }

    // ----------------------------
    // ツール終了
    // ----------------------------
    else if (responseMessage.type === "ToolMessage" && responseMessage.is_end) {
      const toolId = responseMessage.tool_id || "";
      if (toolMessages[toolId]) {
        toolMessages[toolId] = {
          ...toolMessages[toolId],
          tool_response: responseMessage.tool_response || ""
        };
      }
    }
  }

  // ツールメッセージを追加
  Object.values(toolMessages).forEach(toolMsg => {
    newList.push(toolMsg);
  });

  // AIメッセージが存在する場合は最後に追加
  if (assistantMessageContent) {
    newList.push({
      user: "assistant",
      message: assistantMessageContent,
      tool_name: "",
      tool_input: "",
      tool_response: "",
      tool_id: ""
    });
  }

  return newList;
}

/**
 * チャット履歴を取得する
 * @param uid ユーザーID
 * @returns チャット履歴のリスト
 */
export async function getChatHistory(uid: string): Promise<ChatHistorySession[]> {
  try {
    const response = await fetch(`${APP_CONFIG.HISTORY_API_ENDPOINT}/${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // レスポンスが配列の場合はそのまま返し、オブジェクトの場合はhistoryプロパティから取得
    return data.sessions
  } catch (error) {
    console.error("チャット履歴の取得に失敗しました:", error);
    return [];
  }
}

/**
 * 特定のセッションのメッセージを取得してChatMessage形式に変換する
 * @param uid ユーザーID
 * @param sessionId セッションID
 * @returns ChatMessage形式のメッセージリスト
 */
export async function getSessionMessages(uid: string, sessionId: string): Promise<ChatMessage[]> {
  try {
    const history = await getChatHistory(uid);
    const session = history.find(s => s.session_id === sessionId);
    
    if (!session) {
      throw new Error(`セッション ${sessionId} が見つかりません`);
    }

    // ChatHistoryMessage形式からChatMessage形式に変換
    return session.messages.map(msg => ({
      user: msg.role as "assistant" | "user" | "system",
      message: msg.content,
      tool_name: "",
      tool_input: "",
      tool_response: "",
      tool_id: ""
    }));
  } catch (error) {
    console.error("セッションメッセージの取得に失敗しました:", error);
    return [];
  }
}