import { cn } from "../../utils/cn.js";
import Spinner from "./Spinner.jsx";

const variants = {
  primary: "bg-primary-500 hover:bg-primary-600 text-white shadow-sm hover:shadow-md",
  secondary: "bg-surface-2 hover:bg-surface-3 text-teal-primary",
  outline: "border border-gray-200 hover:border-primary-400 hover:text-primary-500 text-gray-700 bg-white hover:bg-primary-50",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  ghost: "hover:bg-teal-surface text-gray-700 hover:text-primary-600",
  gold: "bg-gold-600 hover:bg-gold-700 text-white shadow-sm",
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
