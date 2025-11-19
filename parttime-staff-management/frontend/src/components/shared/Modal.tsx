/* file: frontend/src/components/shared/Modal.tsx */
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop mờ */}
      <div className="modal-backdrop fade show"></div>

      {/* Modal Dialog */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div
          className={`modal-dialog modal-dialog-centered ${
            size ? `modal-${size}` : ""
          }`}
          role="document"
        >
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};
