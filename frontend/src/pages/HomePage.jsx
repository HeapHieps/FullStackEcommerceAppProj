import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  // State to store products from backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get user info to show personalized welcome
  const { user } = useAuth();

  // Load products when page loads
  useEffect(() => {
    fetchProducts();
  }, []);

  // Function to get all products from backend
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">E-Shop Marketplace</h1>
              {user && (
                <p className="text-gray-600 mt-1">
                  Welcome back, {user.full_name}! 
                  {user.user_type === 'seller' && ' (Seller Account)'}
                </p>
              )}
            </div>
            
            {/* Navigation Links */}
            <div className="flex gap-4">
              {!user ? (
                // Show login/register if not logged in
                <>
                  <Link to="/login" className="text-blue-600 hover:text-blue-800">
                    Login
                  </Link>
                  <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Sign Up
                  </Link>
                </>
              ) : (
                // Show logout button if logged in
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Available Products</h2>
        
        {products.length === 0 ? (
          // Message when no products exist
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-xl">No products available yet.</p>
            <p className="text-gray-400 mt-2">
              {user?.user_type === 'seller' 
                ? 'Be the first to add products!' 
                : 'Check back later or become a seller to add products!'}
            </p>
            {user?.user_type === 'seller' && (
              <Link 
                to="/seller/products" 
                className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          // Grid of product cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                {/* Product Image */}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {product.description || 'No description available'}
                  </p>
                  
                  {/* Price and Stock */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                  
                  {/* Store Info */}
                  <p className="text-xs text-gray-500 mb-3">
                    by {product.store_name}
                  </p>
                  
                  {/* Action Button */}
                  <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;