import ReactMarkdown from "react-markdown";
import { cn } from "../../utils/cn.js";
import Avatar from "../ui/Avatar.jsx";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSlice.js";

const ChatBubble = ({ message }) => {
  const user = useSelector(selectUser);
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-end gap-2 animate-slide-up",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shrink-0 mb-1">
          <span className="text-xs">🍽️</span>
        </div>
      )}
      {isUser && (
        <Avatar name={user?.name} size="xs" className="shrink-0 mb-1" />
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary-500 text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
        )}
      >
        {isUser ? (
          // User message — plain text
          <p>{message.content}</p>
        ) : (
          // AI message — render markdown + images!
          <ReactMarkdown
            components={{
              // ✅ Render images inline
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  className="rounded-xl mt-2 mb-1 max-w-full object-cover max-h-40 w-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ),
              // Bold text
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 underline"
                >
                  {children}
                </a>
              ),
              // Paragraphs
              p: ({ children }) => (
                <p className="mb-1 last:mb-0">{children}</p>
              ),
              // Lists
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 my-1">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="text-sm">{children}</li>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;