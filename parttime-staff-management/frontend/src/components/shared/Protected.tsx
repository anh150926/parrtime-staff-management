/* file: frontend/src/components/shared/Protected.tsx */
import React from "react";
import { useAuthStore } from "../../store/authStore";
import { Role } from "../../models/Enums";

interface ProtectedProps {
  role: Role;
  children: React.ReactNode;
}

export const Protected: React.FC<ProtectedProps> = ({ role, children }) => {
  const { user } = useAuthStore();

  // Nếu user không có role này, không hiển thị gì cả
  if (user?.role !== role) return null;

  return <>{children}</>;
};
