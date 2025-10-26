import { Button } from "./ui/button";
import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { TiSpanner } from "react-icons/ti";

// JSONのキーとバリューを色分けして再帰的に表示する関数
const renderJsonColored = (data: unknown, indent = 0) => {
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return (
        <>
          {'['}<br />
          {data.map((item, idx) => (
            <div key={idx} style={{ paddingLeft: 16 * (indent + 1) }}>
              {renderJsonColored(item, indent + 1)}{idx < data.length - 1 ? ',' : ''}
            </div>
          ))}
          {']'}
        </>
      );
    } else {
      return (
        <>
          {'{'}<br />
          {Object.entries(data).map(([key, value], idx, arr) => (
            <div key={key} style={{ paddingLeft: 16 * (indent + 1) }}>
              <span style={{ color: '#2563eb' }}>&quot;{key}&quot;</span>
              <span style={{ color: '#64748b' }}>: </span>
              {typeof value === 'object' && value !== null
                ? renderJsonColored(value, indent + 1)
                : <span style={{ color: typeof value === 'string' ? '#059669' : typeof value === 'number' ? '#a21caf' : '#111827' }}>
                    {JSON.stringify(value)}
                  </span>
              }
              {idx < arr.length - 1 ? <span style={{ color: '#64748b' }}>,</span> : null}
            </div>
          ))}
          {'}'}
        </>
      );
    }
  } else {
    // プリミティブ型
    return <span style={{ color: typeof data === 'string' ? '#059669' : typeof data === 'number' ? '#a21caf' : '#111827' }}>{JSON.stringify(data)}</span>;
  }
};

const ToolMessage = (
  {tool_name, tool_input, tool_response}:
  {tool_name: string; tool_input: string; tool_response: string}
) => {

  let parsedInput: unknown = tool_input;
  let parsedResponse: unknown = tool_response;
  try {
    parsedInput = JSON.parse(tool_input);
  } catch {}
  try {
    parsedResponse = JSON.parse(tool_response);
  } catch {}

  const [isOpen , setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-start my-2 bg-gray-100 p-2 rounded-md border">
      <div className="flex items-center justify-center w-full">
        <TiSpanner className="text-2xl text-blue-500 mr-2 mt-1"/>
        <div className="text-xl font-bold">{tool_name}</div>
        {
          tool_response ? (
            <div className="ml-4 text-green-600 font-semibold">完了</div>
          ) : (
            <div className="ml-4 text-blue-600 font-semibold">実行中...</div>
          )
        }
        { isOpen ? (
          <Button className="ml-auto bg-gray-100 text-gray-800 hover:bg-white hover:cursor-pointer" size="sm" variant="outline" onClick={() => setIsOpen(false)}>
            <IoIosArrowUp />
          </Button>
        ) : (
          <Button className="ml-auto bg-gray-100 text-gray-800 hover:bg-white hover:cursor-pointer" size="sm" onClick={() => setIsOpen(true)}>
            <IoIosArrowDown />
          </Button>
        )}
      </div>
      <div
        className={`transition-all duration-300 overflow-y-auto w-full ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
        style={{
          // もしTailwindのmax-hが足りなければstyleで調整
          // maxHeight: isOpen ? 500 : 0,
        }}
      >
        <div className="mb-2 w-full">
          <div className="text-sm font-semibold">リクエスト</div>
          <pre className="text-xs rounded-md p-2 w-full overflow-x-auto bg-white">
            {typeof parsedInput === 'object' && parsedInput !== null
              ? renderJsonColored(parsedInput)
              : String(parsedInput)}
          </pre>
        </div>
        <div className="mb-2 w-full">
          <div className="text-sm font-semibold">レスポンス</div>
          <pre className="text-xs rounded-md p-2 w-full overflow-x-auto bg-white">
            {typeof parsedResponse === 'object' && parsedResponse !== null
              ? renderJsonColored(parsedResponse)
              : String(parsedResponse)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ToolMessage;