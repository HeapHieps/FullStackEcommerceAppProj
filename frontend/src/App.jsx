import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext'; 
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute'; 

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Seller Pages
import Dashboard from './pages/seller/Dashboard';
import ProductsManagement from './pages/seller/ProductsManagement';
import StoreSettings from './pages/seller/StoreSettings';
import OrdersManagement from './pages/seller/OrdersManagement';

// Buyer Pages
import CartPage from './pages/buyer/CartPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import OrdersPage from './pages/buyer/OrdersPage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider> 
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Seller Routes - Protected */}
              <Route path="/seller/dashboard" element={
                <ProtectedRoute requireAuth requireSeller>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/seller/products" element={
                <ProtectedRoute requireAuth requireSeller>
                  <ProductsManagement />
                </ProtectedRoute>
              } />
              <Route path="/seller/store" element={
                <ProtectedRoute requireAuth requireSeller>
                  <StoreSettings />
                </ProtectedRoute>
              } />
              <Route path="/seller/orders" element={
                <ProtectedRoute requireAuth requireSeller>
                  <OrdersManagement />
                </ProtectedRoute>
              } />

              {/* Buyer Routes - Protected */}
              <Route path="/cart" element={
                <ProtectedRoute requireAuth requireBuyer>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute requireAuth requireBuyer>
                  <CheckoutPage />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute requireAuth requireBuyer>
                  <OrdersPage />
                </ProtectedRoute>
              } />

            </Routes>
          </div>
        </CartProvider> 
      </AuthProvider>
    </Router>
  );
}

export default App;