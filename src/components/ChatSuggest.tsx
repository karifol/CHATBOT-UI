interface ChatSuggestProps {
  onSuggestClick: (message: string) => void;
}

const SUGGESTS = [
  "使い方を教えてください",
  "明日の予測のブレについて教えて",
  "週間予報の文脈を教えて",
];

const ChatSuggest: React.FC<ChatSuggestProps> = ({ onSuggestClick }) => {
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
