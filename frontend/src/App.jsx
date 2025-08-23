import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Seller Pages
import Dashboard from './pages/seller/Dashboard';
import ProductsManagement from './pages/seller/ProductsManagement';
import StoreSettings from './pages/seller/StoreSettings';
import OrdersManagement from './pages/seller/OrdersManagement';

// Protected Route Component
function ProtectedRoute({ children, requireSeller = false }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requireSeller && user.user_type !== 'seller') {
    return <Navigate to="/" />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Seller Routes - Protected */}
            <Route path="/seller/dashboard" element={
              <ProtectedRoute requireSeller={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/seller/products" element={
              <ProtectedRoute requireSeller={true}>
                <ProductsManagement />
              </ProtectedRoute>
            } />
            <Route path="/seller/store" element={
              <ProtectedRoute requireSeller={true}>
                <StoreSettings />
              </ProtectedRoute>
            } />
            <Route path="/seller/orders" element={
              <ProtectedRoute requireSeller={true}>
                <OrdersManagement />
              </ProtectedRoute>
            } />
            
            {/* Placeholder routes for buyer pages we haven't built yet */}
            <Route path="/cart" element={<div className="p-8">Cart Page (Coming Soon)</div>} />
            <Route path="/orders" element={<div className="p-8">My Orders (Coming Soon)</div>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;