import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "../../utils/cn.js";

const BackButton = ({
  // "home" → goes to /, "back" → goes -1, or pass custom path
  to = "back",
  label,
  className,
  variant = "default", // "default" | "editorial"
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to === "back") {
      navigate(-1);
    } else if (to === "home") {
      navigate("/");
    } else {
      navigate(to);
    }
  };

  const isHome = to === "home";

  if (variant === "editorial") {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ x: -3 }}
        className={cn(
          "flex items-center gap-2 text-sm font-medium group transition-colors",
          className
        )}
        style={{ color: "#414848" }}
      >
        <ChevronLeft
          size={16}
          className="group-hover:-translate-x-1 transition-transform"
        />
        {label || (isHome ? "Home" : "Back")}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl",
        "border border-gray-200 bg-white hover:bg-gray-50",
        "transition-all duration-200 group shadow-sm",
        className
      )}
      style={{ color: "#414848" }}
    >
      {isHome ? (
        <Home size={15} className="text-gray-400" />
      ) : (
        <ChevronLeft
          size={15}
          className="text-gray-400 group-hover:-translate-x-0.5 transition-transform"
        />
      )}
      {label || (isHome ? "Home" : "Back")}
    </motion.button>
  );
};

export default BackButton;