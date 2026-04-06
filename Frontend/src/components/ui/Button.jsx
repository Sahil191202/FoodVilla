import { cn } from "../../utils/cn.js";
import Spinner from "./Spinner.jsx";

const variants = {
  primary:
    "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-sm shadow-primary-200/60",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  ghost: "hover:bg-gray-100 text-gray-700",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
  xl: "px-8 py-4 text-lg",
  icon: "p-2",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        // Base styles
        "inline-flex items-center justify-center gap-2",
        "font-medium rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Variant
        variants[variant],
        // Size
        sizes[size],
        // Full width
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" color={variant === "primary" ? "white" : "gray"} />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
