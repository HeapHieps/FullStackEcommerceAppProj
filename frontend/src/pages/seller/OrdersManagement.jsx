import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const OrdersManagement = () => {
  // ==================== STATE MANAGEMENT ====================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, shipped, delivered
  const [updating, setUpdating] = useState(null); // Track which order is being updated

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==================== DATA FETCHING FUNCTIONS ====================
  // Fetch seller's orders
  const fetchOrders = async () => {
    try {
      const response = await api.get('/seller/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== EVENT HANDLERS ====================
  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/seller/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (error) {
      alert('Error updating order status');
    } finally {
      setUpdating(null);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  // Filter orders based on status
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'shipped': return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'delivered': return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  // Calculate order total (only this seller's items)
  const calculateOrderTotal = (items) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>Loading orders...</div>
      </div>
    );
  }

  // ==================== MAIN ORDERS MANAGEMENT RENDER ====================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* ==================== HEADER SECTION ==================== */}
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>Order Management</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>View and manage customer orders</p>
        </div>

        {/* ==================== FILTER TABS ==================== */}
        {/* Filter Tabs */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            {['all', 'pending', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '12px 24px',
                  fontWeight: '500',
                  textTransform: 'capitalize',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: filter === status ? '#2563eb' : '#6b7280',
                  borderBottom: filter === status ? '2px solid #2563eb' : 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (filter !== status) e.target.style.color = '#111827';
                }}
                onMouseOut={(e) => {
                  if (filter !== status) e.target.style.color = '#6b7280';
                }}
              >
                {status}
                {/* Show count for each status filter */}
                <span style={{ marginLeft: '8px', fontSize: '14px' }}>
                  ({orders.filter(o => status === 'all' || o.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== ORDERS LIST OR EMPTY STATE ==================== */}
        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          // Empty state when no orders match current filter
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '48px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {/* Empty orders icon */}
            <svg style={{ width: '96px', height: '96px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {/* Empty state messaging */}
            <p style={{ fontSize: '20px', color: '#4b5563', marginBottom: '8px' }}>No orders found</p>
            <p style={{ color: '#6b7280' }}>
              {filter !== 'all' ? `No ${filter} orders` : 'You haven\'t received any orders yet'}
            </p>
          </div>
        ) : (
          // Orders list when orders exist
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOrders.map((order) => (
              <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                
                {/* ==================== ORDER HEADER ==================== */}
                {/* Order Header */}
                <div style={{ backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    {/* Order ID and timestamp */}
                    <div>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Order ID: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>#{order.id}</span>
                      </p>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                        {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    {/* Status badge and order total */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Status badge with dynamic color */}
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '14px',
                        fontWeight: '500',
                        ...getStatusColor(order.status)
                      }}>
                        {order.status}
                      </span>
                      {/* Order total amount */}
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Total</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold' }}>${calculateOrderTotal(order.items)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================== CUSTOMER INFORMATION ==================== */}
                {/* Customer Info */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '12px', fontSize: '16px' }}>Customer Information</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
                    {/* Customer name */}
                    <div>
                      <p style={{ color: '#6b7280' }}>Name</p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>{order.buyer_name}</p>
                    </div>
                    {/* Customer email */}
                    <div>
                      <p style={{ color: '#6b7280' }}>Email</p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>{order.buyer_email}</p>
                    </div>
                    {/* Shipping address - spans full width */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <p style={{ color: '#6b7280' }}>Shipping Address</p>
                      <p style={{ fontWeight: '500', color: '#111827' }}>{order.shipping_address}</p>
                    </div>
                  </div>
                </div>

                {/* ==================== ORDER ITEMS SECTION ==================== */}
                {/* Order Items */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '12px', fontSize: '16px' }}>Order Items</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {order.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          
                          {/* ==================== PRODUCT IMAGE ==================== */}
                          {/* Small Product Image */}
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
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:10px">No image</div>';
                                }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '10px' }}>
                                No image
                              </div>
                            )}
                          </div>
                          
                          {/* ==================== PRODUCT DETAILS ==================== */}
                          {/* Product Details */}
                          <div>
                            <p style={{ fontWeight: '500', color: '#111827' }}>{item.product_name}</p>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>
                              Qty: {item.quantity} × ${item.price}
                            </p>
                          </div>
                        </div>
                        
                        {/* ==================== ITEM TOTAL ==================== */}
                        {/* Item Total */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: '600', fontSize: '16px' }}>${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ==================== ORDER ACTIONS ==================== */}
                {/* Order Actions */}
                <div style={{ padding: '16px 24px', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    
                    {/* Actions for pending orders */}
                    {order.status === 'pending' && (
                      <>
                        {/* Mark as shipped button */}
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          disabled={updating === order.id}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '500',
                            cursor: updating === order.id ? 'not-allowed' : 'pointer',
                            opacity: updating === order.id ? 0.5 : 1
                          }}
                          onMouseOver={(e) => {
                            if (updating !== order.id) e.target.style.backgroundColor = '#1d4ed8';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#2563eb';
                          }}
                        >
                          {updating === order.id ? 'Updating...' : 'Mark as Shipped'}
                        </button>
                        
                        {/* Cancel order button */}
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          disabled={updating === order.id}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '500',
                            cursor: updating === order.id ? 'not-allowed' : 'pointer',
                            opacity: updating === order.id ? 0.5 : 1
                          }}
                          onMouseOver={(e) => {
                            if (updating !== order.id) e.target.style.backgroundColor = '#b91c1c';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#dc2626';
                          }}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                    
                    {/* Actions for shipped orders */}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        disabled={updating === order.id}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '500',
                          cursor: updating === order.id ? 'not-allowed' : 'pointer',
                          opacity: updating === order.id ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                          if (updating !== order.id) e.target.style.backgroundColor = '#059669';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#10b981';
                        }}
                      >
                        {updating === order.id ? 'Updating...' : 'Mark as Delivered'}
                      </button>
                    )}
                    
                    {/* Status message for completed/cancelled orders */}
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <p style={{ color: '#6b7280', padding: '8px 0' }}>
                        Order {order.status === 'delivered' ? 'completed' : 'cancelled'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;