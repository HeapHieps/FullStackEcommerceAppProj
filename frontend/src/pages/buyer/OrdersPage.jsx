import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const OrdersPage = () => {
  // ==================== STATE MANAGEMENT ====================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    fetchOrders(); // Call the fetchOrders function to retrieve the orders from the API or database
  }, []); // if Dependency array is empty, effect only runs once

  // ==================== DATA FETCHING FUNCTIONS ====================
  // Fetch buyer's orders
  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== EVENT HANDLERS ====================
  // Cancel an order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingOrder(orderId);
    try {
      await api.put(`/orders/${orderId}/cancel`);
      // Refresh orders list
      await fetchOrders();
      alert('Order cancelled successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancellingOrder(null);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  // Get status badge style
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'shipped': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'delivered': return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>Loading orders...</div>
      </div>
    );
  }

  // ==================== MAIN ORDERS PAGE RENDER ====================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '32px', color: '#111827' }}>My Orders</h1>
        
        {orders.length === 0 ? (
          // ==================== EMPTY STATE ====================
          // Empty state
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '48px', textAlign: 'center' }}>
            {/* Empty orders icon */}
            <svg style={{ width: '120px', height: '120px', color: '#9ca3af', margin: '0 auto 24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {/* Empty state messaging */}
            <p style={{ fontSize: '20px', color: '#4b5563', marginBottom: '16px' }}>No orders yet</p>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>When you make your first purchase, it will appear here</p>
            {/* Call-to-action button */}
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
              Start Shopping
            </Link>
          </div>
        ) : (
          // ==================== ORDERS LIST ====================
          // Orders list
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                
                {/* ==================== ORDER HEADER ====================*/}
                {/* Order Header */}
                <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    {/* Order ID and status */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <p style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>
                          Order #{order.id}
                        </p>
                        {/* Status badge with dynamic styling */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '14px',
                          fontWeight: '500',
                          ...getStatusColor(order.status)
                        }}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      {/* Order date and time */}
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {/* Order total amount */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>Total Amount</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>${order.total_amount}</p>
                    </div>
                  </div>
                </div>

                {/* ==================== SHIPPING ADDRESS SECTION ==================== */}
                {/* Shipping Address */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '14px' }}>
                    📍 Shipping Address
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>{order.shipping_address}</p>
                </div>

                {/* ==================== ORDER ITEMS SECTION ==================== */}
                {/* Order Items */}
                <div style={{ padding: '16px 24px' }}>
                  <h3 style={{ fontWeight: '600', color: '#374151', marginBottom: '12px', fontSize: '14px' }}>
                    📦 Order Items
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {order.items && order.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        
                        {/* ==================== PRODUCT IMAGE ==================== */}
                        {/* Product Image - Small */}
                        <div style={{ 
                          width: '48px', 
                          height: '48px', 
                          backgroundColor: '#f3f4f6', 
                          borderRadius: '6px', 
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.product_name}
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
                              fontSize: '10px'
                            }}>
                              No image
                            </div>
                          )}
                        </div>
                        
                        {/* ==================== PRODUCT DETAILS ==================== */}
                        {/* Product Details */}
                        <div style={{ flex: 1 }}>
                          {/* Product name */}
                          <p style={{ fontWeight: '500', color: '#111827', fontSize: '14px' }}>{item.product_name}</p>
                          {/* Store information */}
                          <p style={{ fontSize: '13px', color: '#6b7280' }}>
                            Sold by: {item.store_name}
                          </p>
                          {/* Quantity and unit price */}
                          <p style={{ fontSize: '13px', color: '#6b7280' }}>
                            Qty: {item.quantity} × ${item.price}
                          </p>
                        </div>
                        
                        {/* ==================== ITEM TOTAL ==================== */}
                        {/* Item Total */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ==================== ORDER STATUS ACTIONS ==================== */}
                {/* Order Actions/Status Messages */}
                
                {/* Pending order status */}
                {order.status === 'pending' && (
                  <div style={{ padding: '16px 24px', backgroundColor: '#fef3c7', borderTop: '1px solid #fde68a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '14px', color: '#92400e' }}>
                        ⏳ Your order is being processed by the seller
                      </p>
                      {/* Cancel order button */}
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                        style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          fontWeight: '500',
                          cursor: cancellingOrder === order.id ? 'not-allowed' : 'pointer',
                          opacity: cancellingOrder === order.id ? 0.5 : 1,
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if (cancellingOrder !== order.id) e.target.style.backgroundColor = '#b91c1c';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#dc2626';
                        }}
                      >
                        {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Shipped order status */}
                {order.status === 'shipped' && (
                  <div style={{ padding: '16px 24px', backgroundColor: '#dbeafe', borderTop: '1px solid #bfdbfe' }}>
                    <p style={{ fontSize: '14px', color: '#1e40af' }}>
                      🚚 Your order has been shipped and is on its way!
                    </p>
                  </div>
                )}

                {/* Delivered order status */}
                {order.status === 'delivered' && (
                  <div style={{ padding: '16px 24px', backgroundColor: '#d1fae5', borderTop: '1px solid #a7f3d0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '14px', color: '#065f46' }}>
                        ✅ Order delivered successfully
                      </p>
                      {/* Order again link */}
                      <Link 
                        to="/" 
                        style={{ 
                          color: '#2563eb', 
                          fontSize: '14px', 
                          fontWeight: '500',
                          textDecoration: 'none'
                        }}
                        onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                      >
                        Order Again →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Cancelled order status */}
                {order.status === 'cancelled' && (
                  <div style={{ padding: '16px 24px', backgroundColor: '#fee2e2', borderTop: '1px solid #fecaca' }}>
                    <p style={{ fontSize: '14px', color: '#991b1b' }}>
                      ❌ This order was cancelled
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;