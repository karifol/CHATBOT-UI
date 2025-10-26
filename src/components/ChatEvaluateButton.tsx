import { useState } from "react"
import { FiThumbsUp } from "react-icons/fi";
import { FiThumbsDown } from "react-icons/fi";

const ChatEvaluateButton = () => {
  const [, setFeedback] = useState<"good" | "bad" | null>(null);
  const [hovered, setHovered] = useState<"good" | "bad" | null>(null);

  return (
    <>
      <button
        onClick={() => setFeedback("good")}
        onMouseEnter={() => setHovered("good")}
        onMouseLeave={() => setHovered(null)}
        className="relative px-2 py-1 hover:cursor-pointer hover:bg-gray-200 p-2 rounded"
      >
        <FiThumbsUp
          className="text-gray-600"
        />
        {hovered === "good" && (
          <span className="absolute left-1/2 top-8 -translate-x-1/2 bg-gray-700 text-white text-xs w-20 rounded shadow p-1">
            良い回答です
          </span>
        )}
      </button>
      <button
        onClick={() => setFeedback("bad")}
        onMouseEnter={() => setHovered("bad")}
        onMouseLeave={() => setHovered(null)}
        className="relative px-2 py-1 hover:cursor-pointer hover:bg-gray-200 p-2 rounded"
      >
        <FiThumbsDown
          className="text-gray-600"
        />
        {hovered === "bad" && (
          <span className="absolute left-1/2 top-8 -translate-x-1/2 bg-gray-700 text-white text-xs w-25 rounded shadow p-1">
            良くない回答です
          </span>
        )}
      </button>
    </>
  )
}

export default ChatEvaluateButton