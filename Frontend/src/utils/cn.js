import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge tailwind classes without conflicts!
// cn("px-2 py-1", "px-4") → "py-1 px-4" ✅
export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};