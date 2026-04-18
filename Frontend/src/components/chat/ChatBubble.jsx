import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "../../utils/cn.js";
import Avatar from "../ui/Avatar.jsx";
import { Bot } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSlice.js";

const ChatBubble = ({ message }) => {
  const user = useSelector(selectUser);
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-end gap-2 px-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar
          name={user?.name}
          size="xs"
          className="shrink-0 mb-1 ring-2 ring-white shadow-sm"
        />
      ) : (
        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shrink-0 mb-1 shadow-sm">
          <Bot size={14} className="text-white" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-linear-to-br from-primary-500 to-primary-600 text-white rounded-br-sm px-4 py-2.5 shadow-sm shadow-primary-200"
            : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm overflow-hidden"
        )}
      >
        {isUser ? (
          <p className="px-0 py-0">{message.content}</p>
        ) : (
          <div className="px-4 py-2.5">
            <ReactMarkdown
              components={{
                // ✅ Images render nicely
                img: ({ src, alt }) => (
                  <div className="my-2 -mx-4">
                    <img
                      src={src}
                      alt={alt}
                      className="w-full object-cover max-h-48 rounded-xl"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {alt && (
                      <p className="text-xs text-gray-400 mt-1 px-1">
                        {alt}
                      </p>
                    )}
                  </div>
                ),
                // Bold
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                // Paragraphs
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                // Lists
                ul: ({ children }) => (
                  <ul className="list-none space-y-1 my-1">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-primary-400 mt-0.5">•</span>
                    <span>{children}</span>
                  </li>
                ),
                // Links
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 underline underline-offset-2 hover:text-primary-700"
                  >
                    {children}
                  </a>
                ),
                // Horizontal rule — use as divider
                hr: () => (
                  <hr className="border-gray-100 my-2" />
                ),
                // Code
                code: ({ children }) => (
                  <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;