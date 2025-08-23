import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true, requireBuyer = false, requireSeller = false }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if authentication is required and user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if buyer role is required
  if (requireBuyer && user?.user_type !== 'buyer') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Buyer Account Required</h2>
          <p className="text-yellow-700 mb-6">
            This page is only accessible to buyers. Please login with a buyer account or create one.
          </p>
          <div className="flex gap-4 justify-center">
            <Navigate to="/" />
          </div>
        </div>
      </div>
    );
  }

  // Check if seller role is required
  if (requireSeller && user?.user_type !== 'seller') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-yellow-800 mb-4">Seller Account Required</h2>
          <p className="text-yellow-700 mb-6">
            This page is only accessible to sellers. Please login with a seller account or create one.
          </p>
          <div className="flex gap-4 justify-center">
            <Navigate to="/" />
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render the protected content
  return children;
};

export default ProtectedRoute;