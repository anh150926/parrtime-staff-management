import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // [SỬA LỖI]: Thêm đầy đủ các variant của Bootstrap
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "link"
    | "outline-primary"
    | "outline-secondary"
    | "outline-success"
    | "outline-danger"
    | "outline-warning"
    | "outline-info";
  size?: "sm" | "lg";
  isLoading?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size,
  isLoading,
  icon,
  className = "",
  ...props
}) => {
  const btnClass = `btn btn-${variant} ${
    size ? `btn-${size}` : ""
  } ${className}`;

  return (
    <button
      className={btnClass}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Wait...
        </>
      ) : (
        <>
          {icon && <i className={`bi ${icon} me-2`}></i>}
          {children}
        </>
      )}
    </button>
  );
};
