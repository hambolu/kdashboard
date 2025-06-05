import Link from "next/link";
import React from "react";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info"; // Alert type
  title: string; // Title of the alert
  message: string; // Message of the alert
  showLink?: boolean; // Whether to show the "Learn More" link
  linkHref?: string; // Link URL
  linkText?: string; // Link text
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
}) => {
  const baseStyles = "relative flex items-center gap-3 rounded-lg border px-4 py-3";

  // Define alert styles for each type
  const alertStyles = {
    success: {
      container:
        "border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15",
      icon: "text-success-500",
    },
    error: {
      container:
        "border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15",
      icon: "text-error-500",
    },
    warning: {
      container:
        "border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15",
      icon: "text-warning-500",
    },
    info: {
      container:
        "border-brand-500 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/15",
      icon: "text-brand-500",
    },
  };

  // Icon for each variant
  const icons = {
    success: (
      <svg
        className="fill-current"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 21.0002C16.9705 21.0002 21 16.9707 21 12.0002C21 7.02968 16.9705 3.00018 12 3.00018C7.02944 3.00018 3 7.02968 3 12.0002C3 16.9707 7.02944 21.0002 12 21.0002ZM16.0303 9.96994C16.3232 9.67705 16.3232 9.2022 16.0303 8.9093C15.7374 8.61641 15.2626 8.61641 14.9697 8.9093L10.5 13.379L9.03033 11.9093C8.73744 11.6164 8.26256 11.6164 7.96967 11.9093C7.67678 12.2022 7.67678 12.6771 7.96967 12.9699L9.96967 14.9699C10.2626 15.2628 10.7374 15.2628 11.0303 14.9699L16.0303 9.96994Z"
        />
      </svg>
    ),
    error: (
      <svg
        className="fill-current"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM15.5303 8.46967C15.8232 8.76256 15.8232 9.23744 15.5303 9.53033L13.0607 12L15.5303 14.4697C15.8232 14.7626 15.8232 15.2374 15.5303 15.5303C15.2374 15.8232 14.7626 15.8232 14.4697 15.5303L12 13.0607L9.53033 15.5303C9.23744 15.8232 8.76256 15.8232 8.46967 15.5303C8.17678 15.2374 8.17678 14.7626 8.46967 14.4697L10.9393 12L8.46967 9.53033C8.17678 9.23744 8.17678 8.76256 8.46967 8.46967C8.76256 8.17678 9.23744 8.17678 9.53033 8.46967L12 10.9393L14.4697 8.46967C14.7626 8.17678 15.2374 8.17678 15.5303 8.46967Z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="fill-current"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM12 7.5C12.4142 7.5 12.75 7.83579 12.75 8.25V12.75C12.75 13.1642 12.4142 13.5 12 13.5C11.5858 13.5 11.25 13.1642 11.25 12.75V8.25C11.25 7.83579 11.5858 7.5 12 7.5ZM12 16.5C12.4142 16.5 12.75 16.1642 12.75 15.75C12.75 15.3358 12.4142 15 12 15C11.5858 15 11.25 15.3358 11.25 15.75C11.25 16.1642 11.5858 16.5 12 16.5Z"
        />
      </svg>
    ),
    info: (
      <svg
        className="fill-current"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21ZM12 7.25C12.4142 7.25 12.75 7.58579 12.75 8V12C12.75 12.4142 12.4142 12.75 12 12.75C11.5858 12.75 11.25 12.4142 11.25 12V8C11.25 7.58579 11.5858 7.25 12 7.25ZM12 16C12.5523 16 13 15.5523 13 15C13 14.4477 12.5523 14 12 14C11.4477 14 11 14.4477 11 15C11 15.5523 11.4477 16 12 16Z"
        />
      </svg>
    ),
  };

  return (
    <div className={`${baseStyles} ${alertStyles[variant].container}`}>
      <span className={alertStyles[variant].icon}>{icons[variant]}</span>
      <span className="text-sm font-medium">{title}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{message}</span>

      {showLink && (
        <Link
          href={linkHref}
          className="inline-block mt-3 text-sm font-medium text-gray-500 underline dark:text-gray-400"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
};

export default Alert;
