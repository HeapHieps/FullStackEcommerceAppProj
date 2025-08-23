import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const StoreSettings = () => {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading store settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-gray-600 mt-2">
          {store ? 'Manage your store information' : 'Set up your store to start selling'}
        </p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Store Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Store Name */}
          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
              Store Name *
            </label>
            <input
              id="storeName"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              placeholder="Enter your store name"
            />
            <p className="mt-1 text-sm text-gray-500">
              This is how customers will identify your store
            </p>
          </div>

          {/* Store Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Store Description
            </label>
            <textarea
              id="description"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell customers about your store..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Describe what you sell and what makes your store special
            </p>
          </div>

          {/* Store Info Display */}
          {store && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Store Information</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Store ID:</span> 
                  <span className="ml-2 font-mono">{store.id}</span>
                </p>
                <p>
                  <span className="text-gray-500">Created:</span> 
                  <span className="ml-2">{new Date(store.created_at).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : (store ? 'Update Store' : 'Create Store')}
            </button>
            
            {store && (
              <button
                type="button"
                onClick={() => navigate('/seller/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          {store ? '💡 Tips for Success' : '🚀 Getting Started'}
        </h3>
        {store ? (
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use a clear, memorable store name</li>
            <li>Write a description that highlights your unique products</li>
            <li>Keep your product inventory updated</li>
            <li>Respond to orders promptly</li>
          </ul>
        ) : (
          <div className="text-sm text-blue-800 space-y-2">
            <p>Setting up your store is the first step to start selling!</p>
            <p>After creating your store, you can:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Add products to sell</li>
              <li>Manage your inventory</li>
              <li>Track customer orders</li>
              <li>View sales analytics</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreSettings;