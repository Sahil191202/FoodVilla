import { motion } from "framer-motion";
import Button from "./Button.jsx";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

const ErrorState = ({
  title = "Something went wrong",
  description = "An error occurred. Please try again.",
  onRetry,
  onHome,
  showHome = false,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: "rgba(220,38,38,0.1)" }}
      >
        <AlertTriangle size={28} style={{ color: "#dc2626" }} />
      </div>

      <h3
        className="text-lg font-semibold font-display mb-2"
        style={{ color: "#00191a" }}
      >
        {title}
      </h3>
      <p className="text-sm mb-6 max-w-sm" style={{ color: "#414848" }}>
        {description}
      </p>

      <div className="flex gap-3">
        {onRetry && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
        {(showHome || onHome) && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Home size={14} />}
            onClick={onHome || (() => (window.location.href = "/"))}
          >
            Go Home
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorState;