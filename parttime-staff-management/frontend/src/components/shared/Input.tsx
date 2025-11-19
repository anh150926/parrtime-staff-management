/* file: frontend/src/components/shared/Input.tsx */
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  id,
  ...props
}) => {
  // Tự tạo ID nếu không truyền vào (để label hoạt động)
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="form-label fw-bold">
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`form-control ${error ? "is-invalid" : ""} ${className}`}
        {...props}
      />

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};
