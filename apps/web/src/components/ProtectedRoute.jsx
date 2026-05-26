import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const { isAuthenticated, currentUser, initialLoading } = useAuth();

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;