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
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary-500 text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
        )}
      >
        {/* Render message with line breaks */}
        {message.content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < message.content.split("\n").length - 1 && <br />}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ChatBubble;