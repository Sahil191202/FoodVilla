import { useState, useRef } from "react";
import { Send, Mic } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn.js";

const ChatInput = ({ onSend, isLoading }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || isLoading) return;
    onSend(message.trim());
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const isEmpty = !message.trim();

  return (
    <div className="border-t border-gray-100 bg-white p-3 shrink-0 rounded-b-3xl">
      {/* Input Row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about restaurants..."
            rows={1}
            disabled={isLoading}
            className={cn(
              "w-full resize-none rounded-2xl border bg-gray-50",
              "px-4 py-2.5 pr-4 text-sm text-gray-900 placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent",
              "focus:bg-white transition-all duration-200",
              "disabled:opacity-50 max-h-32 scrollbar-hide",
              "border-gray-200"
            )}
          />
        </div>

        {/* Send Button */}
        <motion.button
          onClick={handleSend}
          disabled={isEmpty || isLoading}
          whileHover={!isEmpty && !isLoading ? { scale: 1.05 } : {}}
          whileTap={!isEmpty && !isLoading ? { scale: 0.95 } : {}}
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
            "transition-all duration-200",
            !isEmpty && !isLoading
              ? "bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-sm shadow-primary-200 hover:shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <Send size={16} />
          )}
        </motion.button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        Enter to send • Shift+Enter for new line
      </p>
    </div>
  );
};

export default ChatInput;