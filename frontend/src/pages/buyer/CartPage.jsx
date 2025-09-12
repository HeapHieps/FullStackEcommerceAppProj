import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CartPage = () => {
  // ==================== STATE MANAGEMENT ====================
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const [updatingItem, setUpdatingItem] = useState(null);

  // ==================== EVENT HANDLERS ====================
  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItem(productId);
    await updateQuantity(productId, newQuantity);
    setUpdatingItem(null);
  };

  // Handle remove item
  const handleRemove = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      setUpdatingItem(productId);
      await removeFromCart(productId);
      setUpdatingItem(null);
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>Loading cart...</div>
      </div>
    );
  }

  // ==================== EMPTY CART STATE ====================
  // Empty cart
  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '32px', color: '#111827' }}>Shopping Cart</h1>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '48px', textAlign: 'center' }}>
            {/* Shopping cart icon SVG */}
            <svg style={{ width: '120px', height: '120px', color: '#9ca3af', margin: '0 auto 24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8m0-8L14.707 15.293c-.63.63-.184 1.707.707 1.707H17M11 21a2 2 0 100-4 2 2 0 000 4zm8 0a2 2 0 100-4 2 2 0 000 4z" 
              />
            </svg>
            {/* Empty state messaging */}
            <p style={{ fontSize: '20px', color: '#4b5563', marginBottom: '16px' }}>Your cart is empty</p>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Add items to your cart to see them here</p>
            {/* Call-to-action button to continue shopping */}
            <Link 
              to="/" 
              style={{
                display: 'inline-block',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN CART PAGE RENDER ====================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '32px', color: '#111827' }}>Shopping Cart</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* ==================== LEFT SECTION - CART ITEMS ==================== */}
            <div style={{ flex: '2' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                {/* Cart Header */}
                <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <p style={{ fontWeight: '600', color: '#374151' }}>
                    {cart.itemCount} {cart.itemCount === 1 ? 'Item' : 'Items'} in Cart
                  </p>
                </div>

                {/* Cart Items List */}
                <div>
                  {cart.items.map((item, index) => (
                    <div key={item.product_id} style={{ 
                      padding: '20px 24px', 
                      borderBottom: index < cart.items.length - 1 ? '1px solid #e5e7eb' : 'none' 
                    }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        {/* ==================== PRODUCT IMAGE ==================== */}
                        {/* Product Image - Small */}
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          backgroundColor: '#f3f4f6', 
                          borderRadius: '6px', 
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#9ca3af' 
                            }}>
                              {/* Image placeholder icon */}
                              <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* ==================== PRODUCT DETAILS ==================== */}
                        {/* Product Details */}
                        <div style={{ flex: 1 }}>
                          {/* Product name */}
                          <h3 style={{ fontWeight: '600', fontSize: '16px', color: '#111827', marginBottom: '4px' }}>
                            {item.name}
                          </h3>
                          {/* Store/seller information */}
                          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                            Sold by: {item.store_name}
                          </p>
                          
                          {/* Price */}
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>
                              ${item.price}
                            </span>
                            <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>
                              each
                            </span>
                          </div>

                          {/* ==================== QUANTITY CONTROLS AND ACTIONS ==================== */}
                          {/* Quantity and Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Quantity Selector */}
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                              {/* Decrease quantity button */}
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                disabled={updatingItem === item.product_id || item.quantity <= 1}
                                style={{
                                  padding: '4px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: updatingItem === item.product_id || item.quantity <= 1 ? 'not-allowed' : 'pointer',
                                  opacity: updatingItem === item.product_id || item.quantity <= 1 ? 0.5 : 1,
                                  fontSize: '18px'
                                }}
                              >
                                −
                              </button>
                              {/* Current quantity display */}
                              <span style={{ 
                                padding: '4px 16px', 
                                borderLeft: '1px solid #e5e7eb',
                                borderRight: '1px solid #e5e7eb',
                                minWidth: '50px',
                                textAlign: 'center'
                              }}>
                                {updatingItem === item.product_id ? '...' : item.quantity}
                              </span>
                              {/* Increase quantity button */}
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                disabled={updatingItem === item.product_id || item.quantity >= item.stock_quantity}
                                style={{
                                  padding: '4px 12px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: updatingItem === item.product_id || item.quantity >= item.stock_quantity ? 'not-allowed' : 'pointer',
                                  opacity: updatingItem === item.product_id || item.quantity >= item.stock_quantity ? 0.5 : 1,
                                  fontSize: '18px'
                                }}
                              >
                                +
                              </button>
                            </div>

                            {/* Stock Info */}
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>
                              {item.stock_quantity} available
                            </span>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemove(item.product_id)}
                              disabled={updatingItem === item.product_id}
                              style={{
                                color: '#dc2626',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: updatingItem === item.product_id ? 'not-allowed' : 'pointer',
                                opacity: updatingItem === item.product_id ? 0.5 : 1,
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                              onMouseOver={(e) => e.target.style.color = '#b91c1c'}
                              onMouseOut={(e) => e.target.style.color = '#dc2626'}
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* ==================== ITEM TOTAL PRICE ==================== */}
                        {/* Item Total */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '14px', color: '#6b7280' }}>Total</p>
                          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ==================== RIGHT SECTION - ORDER SUMMARY ==================== */}
            {/* Order Summary */}
            <div style={{ flex: '1', position: 'sticky', top: '20px', height: 'fit-content' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
                  Order Summary
                </h2>
                
                {/* ==================== PRICE BREAKDOWN ==================== */}
                <div style={{ marginBottom: '16px' }}>
                  {/* Subtotal */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal ({cart.itemCount} items)</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>${cart.total}</span>
                  </div>
                  {/* Shipping cost (free in this case) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Shipping</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>Free</span>
                  </div>
                </div>
                
                {/* ==================== FINAL TOTAL ==================== */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Total</span>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>${cart.total}</span>
                  </div>
                </div>

                {/* ==================== CHECKOUT ACTIONS ==================== */}
                {/* Checkout button */}
                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Proceed to Checkout
                </button>

                {/* Continue shopping link */}
                <Link 
                  to="/"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '16px',
                    color: '#2563eb',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                  onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;