import { useState } from "react"
import { PiCopy } from "react-icons/pi";
import { FaCheck } from "react-icons/fa6";

const ChatCopyButton = ({ message }: { message: string }) => {
  const [isCopyHovered, setIsCopyHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後にリセット
    } catch (err) {
      console.error("コピーに失敗しました:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={() => setIsCopyHovered(true)}
      onMouseLeave={() => setIsCopyHovered(false)}
      className="relative px-2 py-1 hover:cursor-pointer hover:bg-gray-200 p-2 rounded"
    >
      {copied ?
        <FaCheck className="text-green-500 text-xl" /> :
        <PiCopy className="text-xl text-gray-600" />
      }
      {isCopyHovered && !copied && (
        <span className="absolute left-1/2 top-8 -translate-x-1/2 bg-gray-700 text-white text-xs w-15 rounded shadow p-1">
          コピーする
        </span>
      )}
    </button>
  )
}

export default ChatCopyButton