/**
 * チャットメッセージコンポーネント
 * メッセージの種類に応じて適切なサブコンポーネントをレンダリングする
 */
import UserMessage from '@/components/UserMessage';
import AssistantMessage from '@/components/AssistantMessage';
import SystemMessage from '@/components/SystemMessage';
import ToolMessage from '@/components/ToolMessage';

const ChatMessage = ({ message, user, tool_name, tool_input, tool_response}:
  { message: string; user: string; tool_name: string; tool_input: string | object; tool_response: string | object;}
) => {

  // オブジェクトの場合はJSON.stringifyで表示
  const renderValue = (value: string | object) => {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return value;
  };

  if (user === "user") {
    return <UserMessage message={renderValue(message)} />;
  }
  if (user === "assistant") {
    return <AssistantMessage message={renderValue(message)} />;
  }
  if (user === "tool_start") {
    return <ToolMessage
      tool_name={tool_name}
      tool_input={renderValue(tool_input)}
      tool_response={renderValue(tool_response)}
    />;
  }
  if (user === "system") {
    return <SystemMessage message={renderValue(message)} />;
  }
  return null;
};

export default ChatMessage;
