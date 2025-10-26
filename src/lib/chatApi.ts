import { ChatMessage, StreamEvent } from "@/lib/types";

// const CHATBOT_ENDPOINT = "https://ane1.wfc-internal.pt-aws.wni.com/PMDailyReportChatbot/chat"; // for local test
const CHATBOT_ENDPOINT = "http://localhost:8080/";

/**
 * ストリーミングでチャットAPIを呼び出す
 * @param message ユーザーからの入力
 * @param onEvent サーバーから届いたイベントごとに呼ばれるコールバック
 */
export async function callChatApiStream(
  messages: { role: string; content: string }[],
  onEvent: (event: StreamEvent) => void
) {

  const response = await fetch(CHATBOT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
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


// 生成AIからのメッセージを使ってmessageListを更新する
export function updateMessageListWithAIResponse(
  messageList: ChatMessage[],
  responseList: StreamEvent[] | StreamEvent
): ChatMessage[] {
  let newList = [...messageList];

  for (const rawMessage of Array.isArray(responseList) ? responseList : [responseList]) {
    // ----------------------------
    // AIからのメッセージ
    // ----------------------------
    if (rawMessage.type === "token" && rawMessage.content) {
      const text: string = rawMessage.content;
      console.log("Received token:", text);

      // rawMessageが最初のAIからのメッセージならケツに追加する
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
    else if (rawMessage.type === "tool_start") {
      newList = [
        ...newList,
        {
          user: "tool_start",
          message: `ツール ${rawMessage.tool_name} を実行中...`,
          tool_name: rawMessage.tool_name || "",
          tool_input: rawMessage.tool_input || "",
          tool_response: "",
          tool_id: rawMessage.tool_id || ""
        }
      ];
    }

    // ----------------------------
    // ツール終了
    // ----------------------------
    else if (rawMessage.type === "tool_end") {
      newList = newList.map((msg) => {
        if (msg.user === "tool_start" && msg.tool_id === rawMessage.tool_id) {
          return {
            ...msg,
            tool_response: rawMessage.tool_response || ""
          };
        }
        return msg;
      });
    }
  }

  return newList;
}