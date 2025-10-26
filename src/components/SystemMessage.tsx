import { useState } from 'react';

const SystemMessage = ({ message }: { message: string }) => {
    const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex justify-center my-2">
      <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-md max-w-[80%]">
        {collapsed ? (
            <button
              onClick={() => setCollapsed(false)}
              className="underline hover:cursor-pointer"
            >
              システムプロンプト
            </button>
          ) : (
            <div>
              <div className="mb-1">{message}</div>
              <button
                onClick={() => setCollapsed(true)}
                className="underline hover:cursor-pointer text-right w-full"
              >
                閉じる
              </button>
            </div>
          )}
        </div>
      </div>
  );
}

export default SystemMessage