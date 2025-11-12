/*
 * file: frontend/src/App.tsx
 */
import React from "react";
import { AppRouter } from "./routes";
import "./index.css"; // Import CSS

export const App: React.FC = () => {
  return <AppRouter />;
};
