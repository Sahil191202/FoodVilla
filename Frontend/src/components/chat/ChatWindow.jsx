import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MessageSquare, Trash2,
  Minimize2, Maximize2, Bot,
  Sparkles,
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
  <div className="flex items-end gap-2 px-4">
    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shrink-0 shadow-sm">
      <Bot size={14} className="text-white" />
    </div>
    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1.5 items-center h-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-400"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const WelcomeScreen = ({ onSuggestion }) => {
  const suggestions = [
    { emoji: "🍕", text: "Show Italian restaurants" },
    { emoji: "📅", text: "Book a table for 2 tonight" },
    { emoji: "📋", text: "Show my reservations" },
    { emoji: "🌹", text: "Find a romantic restaurant" },
    { emoji: "🍺", text: "Places with craft beer" },
    { emoji: "🏠", text: "Rooftop dining options" },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Bot Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4 shadow-lg shadow-primary-200"
      >
        <Bot size={36} className="text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-6"
      >
        <h3 className="font-bold text-gray-900 text-lg mb-1">
          Hi! I'm GoodFoods AI 👋
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          I can help you discover restaurants, check menus, and book
          tables. Just ask me anything!
        </p>
      </motion.div>

      {/* Quick suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wider">
          Try asking
        </p>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <motion.button
              key={s.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestion(s.text)}
              className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 text-left hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 shadow-sm group"
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="text-xs text-gray-600 group-hover:text-primary-700 font-medium line-clamp-2">
                {s.text}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const ChatWindow = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsChatOpen);
  const messagesEndRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    messages,
    isTyping,
    isLoadingHistory,
    sendMessage,
    clearChat,
    isSending,
  } = useChat();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  const windowWidth = isExpanded ? "w-[420px]" : "w-96";
  const windowHeight = isExpanded ? "h-[600px]" : "h-[520px]";

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => dispatch(toggleChat())}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-2xl shadow-xl",
          "flex items-center justify-center",
          "transition-all duration-300",
          isOpen
            ? "bg-gray-700 hover:bg-gray-800 rounded-full"
            : "bg-linear-to-br from-primary-500 to-primary-700 hover:shadow-primary-200 hover:shadow-2xl"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="minimize"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Minimize2 size={20} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare size={22} className="text-white" />
              {/* Notification dot */}
              {messages.length === 0 && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed bottom-24 right-6 z-50",
              windowWidth,
              "max-w-[calc(100vw-48px)]",
              "bg-gray-50 rounded-3xl shadow-2xl",
              "border border-gray-200/50",
              "flex flex-col overflow-hidden",
              windowHeight
            )}
            style={{
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Header */}
            <div className="bg-linear-to-r from-primary-600 to-primary-700 px-4 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    GoodFoods AI
                  </p>
                  <div className="flex items-center gap-1.5">
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-green-400"
                    />
                    <p className="text-xs text-white/80">
                      {isTyping ? "Typing..." : "Online • Ready to help"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                  title={isExpanded ? "Minimize" : "Expand"}
                >
                  {isExpanded
                    ? <Minimize2 size={15} />
                    : <Maximize2 size={15} />
                  }
                </button>
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="bg-linear-to-br from-primary-500 to-primary-700 p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                <button
                  onClick={() => dispatch(closeChat())}
                  className="p-2 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner size="md" color="primary" />
                </div>
              ) : messages.length === 0 ? (
                <WelcomeScreen onSuggestion={sendMessage} />
              ) : (
                <div className="py-4 space-y-4">
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <ChatInput
              onSend={sendMessage}
              isLoading={isSending || isTyping}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWindow;