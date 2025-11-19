/* file: frontend/src/components/shared/Spinner.tsx */
import React from "react";

export const Spinner: React.FC = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);
