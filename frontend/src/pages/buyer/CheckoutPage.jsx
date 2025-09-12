import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const CheckoutPage = () => {
  // ==================== STATE MANAGEMENT ====================
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Shipping form data - pre-filled with user info if available
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.full_name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  // ==================== EVENT HANDLERS ====================
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form - ensure required shipping fields are filled
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zipCode) {
      setError('Please fill in all shipping fields');
      return;
    }

    setLoading(true);
    
    try {
      // Format shipping address into single string
      const shippingAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}, ${shippingInfo.country}`;
      
      // Send order to backend
      const response = await api.post('/checkout', {
        shippingAddress
      });
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to success/orders page
      alert('Order placed successfully!');
      navigate('/orders');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ==================== EMPTY CART REDIRECT ====================
  // Redirect if cart is empty
  if (!cart.items || cart.items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '48px', textAlign: 'center' }}>
            {/* Empty cart message */}
            <p style={{ fontSize: '20px', color: '#4b5563', marginBottom: '16px' }}>Your cart is empty</p>
            {/* Continue shopping button */}
            <button 
              onClick={() => navigate('/')}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN CHECKOUT PAGE RENDER ====================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '32px', color: '#111827' }}>Checkout</h1>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* ==================== LEFT SECTION - CHECKOUT FORM ==================== */}
          {/* Checkout Form */}
          <div style={{ flex: '2' }}>
            <form onSubmit={handleSubmit}>
              {/* ==================== CONTACT INFORMATION SECTION ==================== */}
              {/* Contact Information */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>📧 Contact Information</h2>
                </div>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {/* Full Name field */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '15px',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    
                    {/* Email field */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '15px',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== SHIPPING ADDRESS SECTION ==================== */}
              {/* Shipping Address */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>📍 Shipping Address</h2>
                </div>
                <div style={{ padding: '24px' }}>
                  {/* Error message display */}
                  {error && (
                    <div style={{
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#991b1b',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      marginBottom: '16px'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Street Address field */}
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '15px',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                      />
                    </div>
                    
                    {/* City and State row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      {/* City field */}
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          placeholder="New York"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '15px',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>
                      
                      {/* State field */}
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          placeholder="NY"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '15px',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>
                    </div>
                    
                    {/* ZIP Code and Country row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      {/* ZIP Code field */}
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          required
                          value={shippingInfo.zipCode}
                          onChange={handleInputChange}
                          placeholder="10001"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '15px',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        />
                      </div>
                      
                      {/* Country dropdown */}
                      <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                          Country
                        </label>
                        <select
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleInputChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '15px',
                            outline: 'none',
                            backgroundColor: 'white'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                        >
                          <option value="USA">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="UK">United Kingdom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== PAYMENT METHOD SECTION ==================== */}
              {/* Payment Method */}
              <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>💳 Payment Method</h2>
                </div>
                <div style={{ padding: '24px' }}>
                  {/* Placeholder for payment processing */}
                  <div style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '6px', padding: '16px' }}>
                    <p style={{ color: '#1e40af', fontSize: '14px' }}>
                      Payment processing will be added in a future update.
                      For now, orders are placed with Cash on Delivery.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ==================== RIGHT SECTION - ORDER SUMMARY ==================== */}
          {/* Order Summary Sidebar */}
          <div style={{ flex: '1', position: 'sticky', top: '20px', height: 'fit-content' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Order Summary</h2>
              </div>
              
              <div style={{ padding: '24px' }}>
                {/* ==================== CART ITEMS LIST ==================== */}
                {/* Cart Items */}
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                  {cart.items.map((item) => (
                    <div key={item.product_id} style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      paddingBottom: '12px',
                      marginBottom: '12px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      {/* Product thumbnail */}
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: '#f3f4f6', 
                        borderRadius: '4px', 
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
                            color: '#9ca3af',
                            fontSize: '8px'
                          }}>
                            No img
                          </div>
                        )}
                      </div>
                      {/* Product details */}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>Qty: {item.quantity}</p>
                      </div>
                      {/* Item total price */}
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* ==================== ORDER TOTALS ==================== */}
                {/* Totals */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  {/* Subtotal line */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Subtotal</span>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>${cart.total}</span>
                  </div>
                  {/* Shipping line */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Shipping</span>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#10b981' }}>Free</span>
                  </div>
                  {/* Tax line */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Tax</span>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>$0.00</span>
                  </div>
                  
                  {/* Final total */}
                  <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>Total</span>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>${cart.total}</span>
                    </div>
                  </div>
                </div>

                {/* ==================== PLACE ORDER BUTTON ==================== */}
                {/* Place Order Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: '100%',
                    backgroundColor: loading ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#1d4ed8';
                  }}
                  onMouseOut={(e) => {
                    if (!loading) e.target.style.backgroundColor = '#2563eb';
                  }}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>

                {/* Terms and conditions disclaimer */}
                <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', marginTop: '12px' }}>
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;