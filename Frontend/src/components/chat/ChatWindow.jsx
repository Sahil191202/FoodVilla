import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  MessageSquare,
  Trash2,
  Minimize2,
} from "lucide-react";
import {
  selectIsChatOpen,
  closeChat,
  toggleChat,
} from "../../features/chat/chatSlice.js";
import { useChat } from "../../hooks/useChat.js";
import ChatBubble from "./ChatBubble.jsx";
import ChatInput from "./ChatInput.jsx";
import Spinner from "../ui/Spinner.jsx";
import { cn } from "../../utils/cn.js";

const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
      <span className="text-xs">🍽️</span>
    </div>
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ChatWindow = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsChatOpen);
  const messagesEndRef = useRef(null);

  const {
    messages,
    isTyping,
    isLoadingHistory,
    sendMessage,
    clearChat,
    isSending,
  } = useChat();

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <>
      {/* Floating Button — always visible */}
      <button
        onClick={() => dispatch(toggleChat())}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full shadow-lg",
          "flex items-center justify-center",
          "transition-all duration-300",
          isOpen
            ? "bg-gray-700 hover:bg-gray-800"
            : "bg-primary-500 hover:bg-primary-600"
        )}
      >
        {isOpen ? (
          <Minimize2 size={20} className="text-white" />
        ) : (
          <>
            <MessageSquare size={22} className="text-white" />
            {/* Unread dot */}
            {messages.length === 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            )}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-50",
            "w-96 max-w-[calc(100vw-48px)]",
            "bg-gray-50 rounded-2xl shadow-2xl border border-gray-200",
            "flex flex-col overflow-hidden",
            "animate-slide-up",
          )}
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-base">🍽️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  GoodFoods AI
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-xs text-gray-500">
                    {isTyping ? "Typing..." : "Online"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                  title="Clear chat"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => dispatch(closeChat())}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Spinner size="md" />
              </div>
            ) : messages.length === 0 ? (
              // Welcome Message
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <span className="text-3xl">🍽️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Hi! I'm GoodFoods AI
                </h3>
                <p className="text-sm text-gray-500">
                  I can help you find restaurants, check availability, and book
                  tables. What are you looking for?
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            isLoading={isSending || isTyping}
          />
        </div>
      )}
    </>
  );
};

export default ChatWindow;
