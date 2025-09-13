import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const Dashboard = () => {
  // ==================== STATE MANAGEMENT ====================
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0
  });
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==================== LIFECYCLE EFFECTS ====================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ==================== DATA FETCHING FUNCTIONS ====================
  const fetchDashboardData = async () => {
    try {
      // Fetch store info
      const storeResponse = await api.get('/seller/store');
      setStore(storeResponse.data);
    } catch (error) {
      console.log('No store yet');
    }

    try {
      // Fetch products to count them
      const productsResponse = await api.get('/seller/products');
      
      // Fetch orders
      const ordersResponse = await api.get('/seller/orders');
      
      // Calculate stats
      const products = productsResponse.data;
      const orders = ordersResponse.data;
      
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      }, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders: pendingOrders,
        revenue: totalRevenue.toFixed(2)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>Loading dashboard...</div>
      </div>
    );
  }

  // ==================== MAIN DASHBOARD RENDER ====================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* ==================== WELCOME HEADER ====================*/}
        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Seller Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Welcome back, {user?.full_name}! Here's your business overview.
          </p>
        </div>

        {/* ==================== STORE INFO CARD ==================== */}
        {/* Store Info Card */}
        {!store ? (
          // No store setup yet
          <div style={{ 
            backgroundColor: '#fef3c7', 
            border: '1px solid #fde68a', 
            borderRadius: '8px', 
            padding: '24px', 
            marginBottom: '32px' 
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
              🏪 Set Up Your Store
            </h2>
            <p style={{ color: '#92400e', marginBottom: '16px' }}>
              You need to create your store before you can start selling.
            </p>
            {/* Create store button */}
            <Link 
              to="/seller/store" 
              style={{
                display: 'inline-block',
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#d97706'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f59e0b'}
            >
              Create Store
            </Link>
          </div>
        ) : (
          // Store exists - show info
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px', 
            marginBottom: '32px' 
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
              🏪 Your Store
            </h2>
            {/* Store details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Store Name</p>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{store.store_name}</p>
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Description</p>
                <p style={{ color: '#374151' }}>{store.description || 'No description'}</p>
              </div>
            </div>
            {/* Edit store settings link */}
            <Link 
              to="/seller/store" 
              style={{
                display: 'inline-block',
                marginTop: '16px',
                color: '#2563eb',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Edit Store Settings →
            </Link>
          </div>
        )}

        {/* ==================== STATS GRID ==================== */}
        {/* Stats Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginBottom: '32px' 
        }}>
          
          {/* ==================== TOTAL PRODUCTS STAT ==================== */}
          {/* Total Products */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Products</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{stats.totalProducts}</p>
              </div>
              {/* Products icon */}
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#eff6ff', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* ==================== TOTAL ORDERS STAT ==================== */}
          {/* Total Orders */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Orders</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#111827' }}>{stats.totalOrders}</p>
              </div>
              {/* Orders icon */}
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#d1fae5', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* ==================== PENDING ORDERS STAT ==================== */}
          {/* Pending Orders */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Pending Orders</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pendingOrders}</p>
              </div>
              {/* Pending icon */}
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* ==================== REVENUE STAT ==================== */}
          {/* Revenue */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>${stats.revenue}</p>
              </div>
              {/* Revenue icon */}
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: '#d1fae5', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== QUICK ACTIONS SECTION ==================== */}
        {/* Quick Actions */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          padding: '24px' 
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
            Quick Actions
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            
            {/* Add new product action */}
            <Link 
              to="/seller/products" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '24px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              {/* Add icon */}
              <svg style={{ width: '32px', height: '32px', marginBottom: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span style={{ fontWeight: '500' }}>Add New Product</span>
            </Link>
            
            {/* View orders action */}
            <Link 
              to="/seller/orders" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#10b981',
                color: 'white',
                padding: '24px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              {/* Orders icon */}
              <svg style={{ width: '32px', height: '32px', marginBottom: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span style={{ fontWeight: '500' }}>View Orders</span>
            </Link>
            
            {/* Store settings action */}
            <Link 
              to="/seller/store" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#8b5cf6',
                color: 'white',
                padding: '24px',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              {/* Settings icon */}
              <svg style={{ width: '32px', height: '32px', marginBottom: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span style={{ fontWeight: '500' }}>Store Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;