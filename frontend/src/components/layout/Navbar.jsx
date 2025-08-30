import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isSeller, isBuyer } = useAuth();
  const { cartItemCount } = useCart();
  const location = useLocation();
  const hideMenu = location.pathname === '/login' || location.pathname === '/register';

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
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#1f1f1f"><path d="M160-733.33V-800h641.33v66.67H160ZM163.33-160v-252h-46v-66.67L160-680h640.67l42.66 201.33V-412h-46v252h-66.66v-252H551.33v252h-388ZM230-226.67h254.67V-412H230v185.33Zm-46-252h592.67H184Zm0 0h592.67L748-613.33H212.67L184-478.67Z"/></svg>
          </Link>

          {/* Desktop Menu */}
          {!hideMenu && (
            <div className="flex ml-auto w-1/2 justify-end">
              <div className="flex w-full justify-between items-center">
                <Link to="/" className="inline-block text-gray-700 hover:text-blue-600 transition-colors">
                  Browse Products
                </Link>

                {isBuyer && (
                  <>
                    <Link to="/cart" className="relative text-gray-700 hover:text-blue-600 transition-colors">
                      Cart
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItemCount}
                        </span>
                      )}
                    </Link>
                    <Link to="/orders" className="text-gray-700 hover:text-blue-600 transition-colors">
                      My Orders
                    </Link>
                  </>
                )}

                {isSeller && (
                  <>
                    <Link to="/seller/products" className="inline-block text-gray-700 hover:text-blue-600 transition-colors">
                      My Products
                    </Link>
                    <Link to="/seller/orders" className="inline-block text-gray-700 hover:text-blue-600 transition-colors">
                      Orders
                    </Link>
                    <Link to="/seller/store" className="inline-block text-gray-700 hover:text-blue-600 transition-colors">
                      Store Settings
                    </Link>
                  </>
                )}

                {user ? (
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold text-gray-800 text-sm">{user.full_name}</p>
                      <p className="text-gray-500 text-xs capitalize">({user.user_type})</p>
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
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;