import React, { FC, ReactNode } from "react";

type BadgeVariant = "light" | "solid";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";
type BadgeSize = "sm" | "base" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant; // Light or solid variant
  color?: BadgeColor; // Badge color
  size?: BadgeSize; // Badge size
  startIcon?: ReactNode; // Icon at the start
  endIcon?: ReactNode; // Icon at the end
}

const Badge: FC<BadgeProps> = ({
  children,
  variant = "light",
  color = "primary",
  size = "base",
  startIcon,
  endIcon,
}) => {
  const baseStyles = "inline-flex items-center font-medium whitespace-nowrap";

  const sizeStyles: Record<BadgeSize, string> = {
    sm: "text-xs px-1.5 py-0.5 rounded",
    base: "text-sm px-2.5 py-0.5 rounded-md",
    lg: "text-base px-3 py-1 rounded-lg",
  };

  // Define variants
  const variants: Record<BadgeVariant, Record<BadgeColor, string>> = {
    light: {
      primary:
        "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400",
      success:
        "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500",
      error:
        "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500",
      warning:
        "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400",
      info: "bg-blue-light-50 text-blue-light-500 dark:bg-blue-light-500/15 dark:text-blue-light-500",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
      dark: "bg-gray-500 text-white dark:bg-white/5 dark:text-white",
    },
    solid: {
      primary: "bg-brand-500 text-white dark:text-white",
      success: "bg-success-500 text-white dark:text-white",
      error: "bg-error-500 text-white dark:text-white",
      warning: "bg-warning-500 text-white dark:text-white",
      info: "bg-blue-light-500 text-white dark:text-white",
      light: "bg-gray-400 dark:bg-white/5 text-white dark:text-white/80",
      dark: "bg-gray-700 text-white dark:text-white",
    },
  };

  // Get styles based on size and color variant
  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={`${baseStyles} ${sizeClass} ${colorStyles}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
