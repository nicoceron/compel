import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "default";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, className = "", variant = "default", ...props }, ref) => {
    const variants = {
      success:
        "bg-green-100 text-white bg-green-900 text-green-200",
      warning:
        "bg-yellow-100 text-white bg-yellow-900 text-yellow-200",
      danger: "bg-red-100 text-white bg-red-900 text-red-200",
      info: "bg-blue-100 text-blue-800 bg-blue-900 text-blue-200",
      default:
        "bg-gray-100 text-white bg-gray-700 text-gray-200",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

