import { useState, useRef } from "react";
import { Send, Mic } from "lucide-react";
import { cn } from "../../utils/cn.js";

const SUGGESTIONS = [
  "Show Italian restaurants 🍕",
  "Book a table for 2 tonight",
  "Show my reservations",
  "Cancel my booking",
];

const ChatInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    onSend(message.trim());
    setMessage("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter — new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    // Auto resize textarea
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="border-t border-gray-100 bg-white p-3">
      {/* Quick Suggestions */}
      {!message && (
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              disabled={isLoading}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-gray-100 hover:bg-primary-50 hover:text-primary-600 text-gray-600 transition-colors whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about restaurants..."
          rows={1}
          disabled={isLoading}
          className={cn(
            "flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50",
            "px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "disabled:opacity-50 transition-all max-h-32"
          )}
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            "transition-all duration-200",
            message.trim() && !isLoading
              ? "bg-primary-500 hover:bg-primary-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Send size={16} />
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;