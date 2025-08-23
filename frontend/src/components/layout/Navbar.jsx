import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isSeller, isBuyer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-xl text-gray-800">E-Shop</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Browse Products
            </Link>

            {isBuyer && (
              <>
                <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Cart
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-blue-600 transition-colors">
                  My Orders
                </Link>
              </>
            )}

            {isSeller && (
              <>
                <Link to="/seller/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/seller/products" className="text-gray-700 hover:text-blue-600 transition-colors">
                  My Products
                </Link>
                <Link to="/seller/orders" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Orders
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-800">{user.full_name}</p>
                    <p className="text-gray-500 text-xs capitalize">{user.user_type}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                Browse Products
              </Link>
              
              {isBuyer && (
                <>
                  <Link to="/cart" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Cart
                  </Link>
                  <Link to="/orders" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    My Orders
                  </Link>
                </>
              )}

              {isSeller && (
                <>
                  <Link to="/seller/dashboard" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/seller/products" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    My Products
                  </Link>
                  <Link to="/seller/orders" className="text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                    Orders
                  </Link>
                </>
              )}

              {user ? (
                <>
                  <div className="py-2 border-t">
                    <p className="font-semibold text-gray-800">{user.full_name}</p>
                    <p className="text-gray-500 text-sm capitalize">{user.user_type}</p>
                  </div>
                  <button onClick={handleLogout} className="bg-gray-200 text-gray-800 py-2 rounded">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Link to="/login" className="text-center bg-gray-200 py-2 rounded" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="text-center bg-blue-600 text-white py-2 rounded" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;