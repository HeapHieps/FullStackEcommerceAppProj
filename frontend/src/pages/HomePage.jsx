import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const HomePage = () => {
  // ==================== STATE MANAGEMENT ====================
  // products: Array storing all products fetched from the backend
  const [products, setProducts] = useState([]);
  // loading: Shows loading message while fetching products from server
  const [loading, setLoading] = useState(true);
  // selectedCategory: Tracks which category filter is active ('all' by default)
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // addToCart: Function to add items to shopping cart
  // isInCart: Function to check if item already exists in cart
  const { addToCart, isInCart } = useCart();
  // user: Current logged-in user info (null if not logged in)
  // isBuyer: Boolean - true if user is a buyer, false if seller or not logged in
  const { user, isBuyer } = useAuth();

  // List of product categories
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

  const DEFAULT_PRODUCT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAV1BMVEXv8fNod4f19vhkdISPmqVcbX52g5L29/iYoq3l6OuCj5vd4eRfcIHr7fDL0NVaa33Bx81ufIuwt7+7wch8iZeiq7TU2N2Ml6KVn6miqrTGy9G1u8PP1Nl1USWeAAADHUlEQVR4nO3c7XKiMBhAYUjEoAb8/qj1/q9zxXasBFFhE3njnOfXzuzW6emLS42JSQIAAAAAAAAAAAAAAAAAAAAAAAAAAAC4VEhDx1XMIh+FclgPXXdWbDIdjl1Ohg5UG5uGpJdDB5ZZ0MA0td/DPhfNNuwIz0McDVuoch26cGoopJDCVwtt5pW8Qrub+DSz4gqzmdf/1QuJhV4fmMK3obA3Ct+Gwt5iKFRGXdZw+j2w/EKVrPdjnY4PZb9vUHyhWWhb/Y3W2XjXZ4zSC1X+t7ihs3WPROGF6lBb25gfuyfKLlQLZ3nKdl8SlF2YuK+Ke6wmiS5Ui8b6W9Z5iKILzaixsmEXXYcoulAt3cDUbj+qMGkWdn8iRld4+KhCtWk+D5tXqUomj35nFV1ovpqFpROjZvv5PMuL1gcWXZjs5o2r1P2y8ue31rR1gU52oZk6Q7Sreogqf38GWrclyi5MZvVbvh47X/T3pmPrFIUXquPtdap1/Tea2ruqbVMUXniO0Ncx2s2k1uC8bdwyRemFiSryubVa2yz9dp+DzguP+4niC6vG4yr/Wp3Uk8CWCzWCwmoVyhj3W7+7s+HeFKMovPfPy8atsmWKkRa27k1pTjHOwpYJ3p1ilIUPdxe5U4yx8Mn2KWeKERY+3R9Wn2J8hS9sgKslRlf40g6/2ws1tsIXtzDeTDGywge3ibYpxlXYYRPqdYpRFb48wdspxlTYcRvx7xQjKuy8T1qn1SvmeAp7bAS/TDGawl473aspxlLYcyv/OTGJo7D3WYXzhRpFYafbhJt4/ZPgQj+nTQQX/scE4yj0dV5IbKG3A1FSC/2d+BJa6PFIm8xCn2f2RBZ6PZQosdDTbUJuoSq9HrqUV+h3ggILvR8Mllbo/+SzsMIAR7tlFYY4uy6qMMjhfEmF5hTi0wcEFU5Ofm8T4grtOsypbjmFaaCPjxBUGAiFFFL4jNkGL9wPPEP3EJd37g7q9ycuww5R22H7zmapDflZX7rXCVS/itV0HMp0VQwfeDm0HUpjBy4AAAAAAAAAAAAAAAAAAAAAAAAAAACAz/APOCY/FtgxKw4AAAAASUVORK5CYII=';

  // ==================== SIDE EFFECTS ====================
  // useEffect runs after component mounts (appears on screen)
  // Empty dependency array [] means this only runs once
  useEffect(() => {
    fetchProducts();
  }, []);

  // ==================== DATA FETCHING ====================
  const fetchProducts = async () => {
    try {
      // GET request to backend /products endpoint
      const response = await api.get('/products');
      // Store products in state
      setProducts(response.data);
    } catch (error) {
      // Log any errors (could show error message to user here)
      console.error('Error fetching products:', error);
    } finally {
      // Always stop loading spinner, even if error occurred
      setLoading(false);
    }
  };

  // ==================== FILTERING LOGIC ====================
  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // ==================== LOADING STATE ====================
  // loading while fetching data
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>Loading products...</div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* ==================== HEADER SECTION ==================== */}
      {/* White header bar with page title and welcome message */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Shop All Products</h1>
          {/* Only show welcome message if user is logged in */}
          {user && (
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              Welcome back, {user.full_name}!
            </p>
          )}
        </div>
      </div>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Flex container for sidebar and products grid */}
        <div style={{ display: 'flex', gap: '24px' }}>
          
          {/* ==================== LEFT SIDEBAR ==================== */}
          {/* Contains category filters and price filters */}
          <div style={{ width: '256px', flexShrink: 0 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>Categories</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {/* Map through categories array to create filter buttons */}
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
                      // Hover effect - gray background on hover (unless already selected)
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

              {/* ==================== PRICE FILTERS ==================== */}
              {/* Not functional yet - just UI placeholders */}
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

          {/* ==================== RIGHT SIDE - PRODUCTS AREA ==================== */}
          <div style={{ flex: 1 }}>
            {/* ==================== RESULTS HEADER ==================== */}
            {/* Shows count of products and sort dropdown */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ color: '#6b7280' }}>
                  Showing <span style={{ fontWeight: '600' }}>{filteredProducts.length}</span> products
                </p>
                {/* Sort dropdown - not functional yet */}
                <select style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '4px 8px', fontSize: '14px' }}>
                  <option>Sort by: Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                </select>
              </div>
            </div>

            {/* ==================== PRODUCTS GRID ==================== */}
            {filteredProducts.length === 0 ? (
              // Show this message if no products in selected category
              <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '48px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '20px' }}>No products found in this category.</p>
              </div>
            ) : (
              // Grid layout - auto-fill creates as many columns as fit (min 240px each)
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px'
              }}>
                {/* Map through filtered products to create product cards */}
                {filteredProducts.map((product) => (
                  <div key={product.id} style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    {/* ==================== PRODUCT IMAGE ==================== */}
                    {/* Square aspect ratio container using padding-bottom trick */}
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
                          objectFit: 'cover' // Maintains aspect ratio, crops if needed
                        }}
                        // If image fails to load, use default placeholder
                        onError={(e) => {
                          e.target.src = DEFAULT_PRODUCT_IMAGE;
                        }}
                      />
                    </div>
                    
                    {/* ==================== PRODUCT DETAILS ==================== */}
                    <div style={{ padding: '16px' }}>
                      {/* Product name */}
                      <h3 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '18px' }}>
                        {product.name}
                      </h3>
                      
                      {/* Product description - only show if exists */}
                      {product.description && (
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#6b7280', 
                          marginBottom: '8px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.4'
                        }}>
                          {product.description}
                        </p>
                      )}
                      
                      {/* Star rating - hardcoded|placeholder for now */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                        <span style={{ color: '#facc15' }}>★★★★☆</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>(128)</span>
                      </div>
                      
                      {/* Price */}
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          ${product.price}
                        </span>
                      </div>
                      
                      {/* Stock status - green if in stock, red if out */}
                      <p style={{ fontSize: '14px', color: product.stock_quantity > 0 ? '#16a34a' : '#dc2626', marginBottom: '12px' }}>
                        {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                      </p>
                      
                      {/* Store name */}
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                        Sold by: {product.store_name}
                      </p>
                      
                      {/* ==================== ADD TO CART BUTTON ==================== */}
                      {/* Only show for buyers (sellers can't buy) */}
                      {isBuyer && (
                        <button 
                          onClick={() => addToCart(product.id, 1)} // Add 1 quantity
                          // Disable if already in cart or out of stock
                          disabled={isInCart(product.id) || product.stock_quantity === 0}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: 'none',
                            // Different colors based on button state
                            backgroundColor: isInCart(product.id) ? '#d1d5db' : product.stock_quantity === 0 ? '#e5e7eb' : '#fbbf24',
                            color: isInCart(product.id) || product.stock_quantity === 0 ? '#6b7280' : '#111827',
                            fontWeight: '500',
                            cursor: isInCart(product.id) || product.stock_quantity === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {/* Button text changes based on state */}
                          {isInCart(product.id) ? 'In Cart' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
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