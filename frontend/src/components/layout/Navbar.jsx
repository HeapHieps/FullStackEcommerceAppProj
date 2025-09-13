import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  // ==================== STATE MANAGEMENT ====================
  const navigate = useNavigate();
  const { user, logout, isSeller, isBuyer } = useAuth();
  const { cartItemCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Hide navigation menu on login/register pages
  const hideMenu = location.pathname === '/login' || location.pathname === '/register';

  // ==================== EVENT HANDLERS ====================
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ==================== STYLING CONSTANTS ====================
  const linkStyle = {
    color: '#374151',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    transition: 'all 0.2s',
    fontWeight: '500',
    fontSize: '15px'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: '#eff6ff',
    color: '#2563eb'
  };

  // ==================== MAIN NAVBAR RENDER ====================
  return (
    <nav style={{
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          
          {/* ==================== LOGO SECTION ==================== */}
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            {/* Logo icon container */}
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#2563eb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Shopping cart icon SVG */}
              <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8m0-8L14.707 15.293c-.63.63-.184 1.707.707 1.707H17" 
                />
              </svg>
            </div>
            {/* Brand name */}
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>MarketPlace</span>
          </Link>

          {/* ==================== DESKTOP MENU ==================== */}
          {/* Desktop Menu */}
          {!hideMenu && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              
              {/* ==================== CENTER NAVIGATION ==================== */}
              {/* Center Navigation */}
              <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Browse Products - available to everyone */}
                <Link 
                  to="/" 
                  style={location.pathname === '/' ? activeLinkStyle : linkStyle}
                  onMouseOver={(e) => {
                    if (location.pathname !== '/') {
                      e.target.style.backgroundColor = '#f3f4f6';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (location.pathname !== '/') {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  Browse Products
                </Link>

                {/* Buyer-specific navigation links */}
                {isBuyer && (
                  <>
                    {/* Cart link with item count */}
                    <Link 
                      to="/cart" 
                      style={location.pathname === '/cart' ? activeLinkStyle : linkStyle}
                      onMouseOver={(e) => {
                        if (location.pathname !== '/cart') {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (location.pathname !== '/cart') {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      Cart{cartItemCount > 0 && `(${cartItemCount})`}
                    </Link>
                    {/* Orders link */}
                    <Link 
                      to="/orders" 
                      style={location.pathname === '/orders' ? activeLinkStyle : linkStyle}
                      onMouseOver={(e) => {
                        if (location.pathname !== '/orders') {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (location.pathname !== '/orders') {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      My Orders
                    </Link>
                  </>
                )}

                {/* Seller-specific navigation links */}
                {isSeller && (
                  <>
                    {/* Dashboard link */}
                    <Link 
                      to="/seller/dashboard" 
                      style={location.pathname === '/seller/dashboard' ? activeLinkStyle : linkStyle}
                      onMouseOver={(e) => {
                        if (location.pathname !== '/seller/dashboard') {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (location.pathname !== '/seller/dashboard') {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      Dashboard
                    </Link>
                    {/* Products management link */}
                    <Link 
                      to="/seller/products" 
                      style={location.pathname === '/seller/products' ? activeLinkStyle : linkStyle}
                      onMouseOver={(e) => {
                        if (location.pathname !== '/seller/products') {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (location.pathname !== '/seller/products') {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      My Products
                    </Link>
                    {/* Orders management link */}
                    <Link 
                      to="/seller/orders" 
                      style={location.pathname === '/seller/orders' ? activeLinkStyle : linkStyle}
                      onMouseOver={(e) => {
                        if (location.pathname !== '/seller/orders') {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (location.pathname !== '/seller/orders') {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      Orders
                    </Link>
                    {/* Store settings link */}
                    <Link 
                      to="/seller/store" 
                      style={location.pathname === '/seller/store' ? activeLinkStyle : linkStyle}
                      onMouseOver={(e) => {
                        if (location.pathname !== '/seller/store') {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (location.pathname !== '/seller/store') {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      Store Settings
                    </Link>
                  </>
                )}
              </nav>

              {/* ==================== USER SECTION ==================== */}
              {/* User Section */}
              {user ? (
                // Logged in user display
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* User info display */}
                  <div style={{ 
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{user.full_name}</span>
                    <span style={{ color: '#6b7280', marginLeft: '6px', fontSize: '13px' }}>
                      ({user.user_type})
                    </span>
                  </div>
                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // Not logged in - show login/register links
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Login link */}
                  <Link 
                    to="/login" 
                    style={{
                      color: '#374151',
                      textDecoration: 'none',
                      padding: '8px 16px',
                      fontWeight: '500',
                      fontSize: '14px'
                    }}
                    onMouseOver={(e) => e.target.style.color = '#2563eb'}
                    onMouseOut={(e) => e.target.style.color = '#374151'}
                  >
                    Login
                  </Link>
                  {/* Sign up button */}
                  <Link 
                    to="/register" 
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '8px 20px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontWeight: '500',
                      fontSize: '14px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ==================== MOBILE MENU BUTTON ==================== */}
          {/* Mobile Menu Button (hidden for now, can be implemented later) */}
          {!hideMenu && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none', // Set to 'block' on mobile breakpoint
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {/* Hamburger menu icon */}
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;