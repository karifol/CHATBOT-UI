/**
 * チャットの提案メッセージコンポーネント
 */

const SUGGESTS = [
  "使い方を教えてください",
  "プログラミングについて質問があります",
  "文章の要約をお願いします",
  "創作のアイデアをください"
];

const ChatSuggest = ({ onSuggestClick } : { onSuggestClick: (text: string) => void }) => {
  return (
    <div className="flex gap-2 mb-4 flex-wrap justify-center">
      {SUGGESTS.map((text, idx) => (
        <button
          key={idx}
          type="button"
          className="px-3 py-1 hover:bg-gray-200 hover:cursor-pointer rounded-3xl border border-gray-300 text-sm"
          onClick={() => onSuggestClick(text)}
        >
          {text}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggest;
