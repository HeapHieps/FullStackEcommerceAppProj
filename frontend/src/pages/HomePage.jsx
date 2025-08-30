import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart, isInCart } = useCart();
  const { user, isBuyer } = useAuth();

  // Product Categories
  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'electronics', name: 'Electronics', icon: '💻' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'home', name: 'Home & Garden', icon: '🏠' },
    { id: 'toys', name: 'Toys & Games', icon: '🎮' },
    { id: 'sports', name: 'Sports & Outdoors', icon: '⚽' },
    { id: 'food', name: 'Food & Grocery', icon: '🍎' },
    { id: 'beauty', name: 'Beauty & Health', icon: '💄' },
    { id: 'automotive', name: 'Automotive', icon: '🚗' },
    { id: 'other', name: 'Other', icon: '📦' },
  ];

  const DEFAULT_PRODUCT_IMAGE = 'https://via.placeholder.com/300x300/f3f4f6/6b7280?text=No+Image';

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header Section */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Shop All Products</h1>
          {user && (
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              Welcome back, {user.full_name}!
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* Left Sidebar */}
          <div style={{ width: '256px', flexShrink: 0 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>Categories</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {categories.map((category) => (
                  <li key={category.id} style={{ marginBottom: '4px' }}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: selectedCategory === category.id ? '#dbeafe' : 'transparent',
                        color: selectedCategory === category.id ? '#1d4ed8' : '#374151',
                        fontWeight: selectedCategory === category.id ? '500' : 'normal',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseOver={(e) => {
                        if (selectedCategory !== category.id) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedCategory !== category.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Price Filters */}
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <h3 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px' }}>Price Range</h3>
                <div style={{ fontSize: '14px' }}>
                  {['Under $25', '$25 to $50', '$50 to $100', 'Over $100'].map((range) => (
                    <label key={range} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" />
                      <span>{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Products */}
          <div style={{ flex: 1 }}>
            {/* Results Header */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#6b7280' }}>
                  Showing <span style={{ fontWeight: '600' }}>{filteredProducts.length}</span> products
                </p>
                <select style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '4px 8px', fontSize: '14px' }}>
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '48px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '20px' }}>No products found in this category.</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px'
              }}>
                {filteredProducts.map((product) => (
                  <div key={product.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    {/* Product Image */}
                    <div style={{ width: '100%', paddingBottom: '100%', position: 'relative', backgroundColor: '#f3f4f6' }}>
                      <img 
                        src={product.image_url || DEFAULT_PRODUCT_IMAGE}
                        alt={product.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontWeight: '500', marginBottom: '8px', minHeight: '48px' }}>
                        {product.name}
                      </h3>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <span style={{ color: '#facc15' }}>★★★★☆</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>(128)</span>
                      </div>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          ${product.price}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '14px', color: product.stock_quantity > 0 ? '#16a34a' : '#dc2626', marginBottom: '12px' }}>
                        {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                      </p>
                      
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                        Sold by: {product.store_name}
                      </p>
                      
                      {isBuyer ? (
                        <button 
                          onClick={() => addToCart(product.id, 1)}
                          disabled={isInCart(product.id) || product.stock_quantity === 0}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isInCart(product.id) ? '#d1d5db' : product.stock_quantity === 0 ? '#e5e7eb' : '#fbbf24',
                            color: isInCart(product.id) || product.stock_quantity === 0 ? '#6b7280' : '#111827',
                            fontWeight: '500',
                            cursor: isInCart(product.id) || product.stock_quantity === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isInCart(product.id) ? 'In Cart' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      ) : (
                        <button style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}>
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;