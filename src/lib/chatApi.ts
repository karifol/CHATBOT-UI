import { ChatMessage, ResponseMessage } from "@/lib/types";
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
  responseList: ResponseMessage | ResponseMessage[]
): ChatMessage[] {
  let newList = [...messageList];

  for (const responseMessage of Array.isArray(responseList) ? responseList : [responseList]) {
    // ----------------------------
    // AIからのメッセージ
    // ----------------------------
    if (responseMessage.type === "AIMessageChunk" && responseMessage.content) {
      const text: string = responseMessage.content;

      // responseMessageが最初のAIからのメッセージならケツに追加する
      // 判断基準はmassgeeListの最後のメッセージがuserかどうか
      let isStart = true;
      const lastMessage = newList[newList.length - 1];
      if (lastMessage.user === "assistant") {
        isStart = false;
      }

      // 最初のメッセージならケツに箱を用意する
      if (isStart) {
        newList = [
          ...newList,
          {
            user: "assistant",
            message: text,
            tool_name: "",
            tool_input: "",
            tool_response: "",
            tool_id: ""
          }
        ];
      }
      // 最初のメッセージでなければケツのメッセージを更新する
      else {
        newList = newList.map((msg, idx) => {
          if (idx === newList.length - 1) {
            return {
              ...msg,
              message: msg.message + text
            };
          }
          return msg;
        });
      }
    }

    // ----------------------------
    // ツール開始
    // ----------------------------
    else if (responseMessage.type === "ToolMessage" && responseMessage.is_start) {
      newList = [
        ...newList,
        {
          user: "tool_start",
          message: `ツール ${responseMessage.tool_name} を実行中...`,
          tool_name: responseMessage.tool_name || "",
          tool_input: responseMessage.tool_input || "",
          tool_response: "",
          tool_id: responseMessage.tool_id || ""
        }
      ];
    }

    // ----------------------------
    // ツール終了
    // ----------------------------
    else if (responseMessage.type === "ToolMessage" && responseMessage.is_end) {
      newList = newList.map((msg) => {
        if (msg.user === "tool_start" && msg.tool_id === responseMessage.tool_id) {
          return {
            ...msg,
            tool_response: responseMessage.tool_response || ""
          };
        }
        return msg;
      });
    }
  }

  return newList;
}