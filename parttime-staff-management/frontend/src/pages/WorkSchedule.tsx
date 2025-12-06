import React from "react";
import { Navigate } from "react-router-dom";

const WorkSchedule: React.FC = () => {
  // Redirect to my-shifts as default
  return <Navigate to="/my-shifts" replace />;
};

export default WorkSchedule;
