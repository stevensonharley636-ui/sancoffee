import React from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (user === null) {
    return (
      <div
        data-testid="auth-loading"
        className="min-h-screen flex items-center justify-center bg-gh-background"
      >
        <Loader2 className="animate-spin text-gh-primary" size={28} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};
