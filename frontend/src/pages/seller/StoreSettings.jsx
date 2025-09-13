import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const StoreSettings = () => {
  // ==================== STATE MANAGEMENT ====================
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form data
  const [formData, setFormData] = useState({
    storeName: '',
    description: ''
  });

  useEffect(() => {
    fetchStore();
  }, []);

  // ==================== DATA FETCHING FUNCTIONS ====================
  // Fetch existing store data
  const fetchStore = async () => {
    try {
      const response = await api.get('/seller/store');
      setStore(response.data);
      setFormData({
        storeName: response.data.store_name,
        description: response.data.description || ''
      });
    } catch (error) {
      // No store exists yet - that's ok
      console.log('No store found');
    } finally {
      setLoading(false);
    }
  };

  // ==================== EVENT HANDLERS ====================
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    // Validate
    if (!formData.storeName.trim()) {
      setMessage({ type: 'error', text: 'Store name is required' });
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/seller/store', formData);
      setStore(response.data.store);
      setMessage({ type: 'success', text: 'Store settings saved successfully!' });
      
      // If this was first time creating store, redirect to products
      if (!store) {
        setTimeout(() => {
          navigate('/seller/products');
        }, 2000);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error saving store settings' 
      });
    } finally {
      setSaving(false);
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>Loading store settings...</div>
      </div>
    );
  }

  // ==================== MAIN STORE SETTINGS RENDER ====================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* ==================== HEADER SECTION ==================== */}
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>Store Settings</h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            {store ? 'Manage your store information' : 'Set up your store to start selling'}
          </p>
        </div>

        {/* ==================== MESSAGE ALERT ==================== */}
        {/* Message Alert */}
        {message.text && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            border: message.type === 'success' ? '1px solid #6ee7b7' : '1px solid #fca5a5',
            color: message.type === 'success' ? '#065f46' : '#991b1b'
          }}>
            {message.text}
          </div>
        )}

        {/* ==================== MAIN CARD ==================== */}
        {/* Main Card */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          {/* Card Header */}
          <div style={{ backgroundColor: '#f9fafb', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
              {store ? '🏪 Your Store Details' : '🚀 Create Your Store'}
            </h2>
          </div>

          {/* ==================== FORM SECTION ==================== */}
          {/* Form Section */}
          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {/* Store Name Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Store Name *
              </label>
              <input
                type="text"
                required
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="Enter your store name"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <p style={{ marginTop: '4px', fontSize: '13px', color: '#6b7280' }}>
                This is how customers will identify your store
              </p>
            </div>

            {/* Store Description */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Store Description
              </label>
              <textarea
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell customers about your store..."
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <p style={{ marginTop: '4px', fontSize: '13px', color: '#6b7280' }}>
                Describe what you sell and what makes your store special
              </p>
            </div>

            {/* ==================== STORE INFO DISPLAY ==================== */}
            {/* Store Info Display */}
            {store && (
              <div style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '6px', 
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  📊 Store Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
                  {/* Store ID */}
                  <div>
                    <span style={{ color: '#6b7280' }}>Store ID:</span>
                    <span style={{ marginLeft: '8px', fontFamily: 'monospace', fontWeight: '500', color: '#111827' }}>
                      #{store.id}
                    </span>
                  </div>
                  {/* Creation date */}
                  <div>
                    <span style={{ color: '#6b7280' }}>Created:</span>
                    <span style={{ marginLeft: '8px', fontWeight: '500', color: '#111827' }}>
                      {new Date(store.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ACTION BUTTONS ==================== */}
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* Submit button */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '10px 24px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '16px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!saving) e.target.style.backgroundColor = '#1d4ed8';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                }}
              >
                {saving ? 'Saving...' : (store ? 'Update Store' : 'Create Store')}
              </button>
              
              {/* Cancel button - only shown for existing stores */}
              {store && (
                <button
                  type="button"
                  onClick={() => navigate('/seller/dashboard')}
                  style={{
                    padding: '10px 24px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    fontWeight: '500',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ==================== HELP CARDS ==================== */}
        {/* Help Cards */}
        <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Getting Started Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px', marginRight: '8px' }}>🚀</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {store ? 'Next Steps' : 'Getting Started'}
              </h3>
            </div>
            {/* Dynamic checklist based on store existence */}
            <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              {store ? (
                <>
                  <li style={{ marginBottom: '8px' }}>✓ Add products to your catalog</li>
                  <li style={{ marginBottom: '8px' }}>✓ Set competitive prices</li>
                  <li style={{ marginBottom: '8px' }}>✓ Upload high-quality images</li>
                  <li>✓ Monitor your orders daily</li>
                </>
              ) : (
                <>
                  <li style={{ marginBottom: '8px' }}>1. Create your store</li>
                  <li style={{ marginBottom: '8px' }}>2. Add your products</li>
                  <li style={{ marginBottom: '8px' }}>3. Set up pricing</li>
                  <li>4. Start selling!</li>
                </>
              )}
            </ul>
          </div>

          {/* Tips Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px', marginRight: '8px' }}>💡</span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                Pro Tips
              </h3>
            </div>
            {/* Best practices for sellers */}
            <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '8px' }}>• Use clear, memorable store names</li>
              <li style={{ marginBottom: '8px' }}>• Write detailed descriptions</li>
              <li style={{ marginBottom: '8px' }}>• Respond to orders quickly</li>
              <li>• Keep inventory updated</li>
            </ul>
          </div>
        </div>

        {/* ==================== STATS PREVIEW ==================== */}
        {/* Stats Preview (if store exists) */}
        {store && (
          <div style={{ marginTop: '24px', backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
              📈 Quick Stats
            </h3>
            {/* Basic metrics display - hardcoded to 0 for new stores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              {/* Products count */}
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>0</p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Products</p>
              </div>
              {/* Orders count */}
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>0</p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Orders</p>
              </div>
              {/* Revenue amount */}
              <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>$0</p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Revenue</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSettings;