import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Validation du token
  if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
