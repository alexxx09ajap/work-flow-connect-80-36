
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, state } = useAuth();
  const location = useLocation();

  // If not authenticated and not loading, redirect to login
  if (!isAuthenticated && !state.loading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If still loading, you could show a loading state
  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wfc-purple"></div>
      </div>
    );
  }

  // If authenticated and not loading, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
