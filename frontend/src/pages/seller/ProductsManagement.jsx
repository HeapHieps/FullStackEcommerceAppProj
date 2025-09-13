import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const ProductsManagement = () => {
  // ==================== STATE MANAGEMENT ====================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form data for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    category: 'other'
  });
  const [formError, setFormError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const DEFAULT_PRODUCT_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAV1BMVEXv8fNod4f19vhkdISPmqVcbX52g5L29/iYoq3l6OuCj5vd4eRfcIHr7fDL0NVaa33Bx81ufIuwt7+7wch8iZeiq7TU2N2Ml6KVn6miqrTGy9G1u8PP1Nl1USWeAAADHUlEQVR4nO3c7XKiMBhAYUjEoAb8/qj1/q9zxXasBFFhE3njnOfXzuzW6emLS42JSQIAAAAAAAAAAAAAAAAAAAAAAAAAAAC4VEhDx1XMIh+FclgPXXdWbDIdjl1Ohg5UG5uGpJdDB5ZZ0MA0td/DPhfNNuwIz0McDVuoch26cGoopJDCVwtt5pW8Qrub+DSz4gqzmdf/1QuJhV4fmMK3obA3Ct+Gwt5iKFRGXdZw+j2w/EKVrPdjnY4PZb9vUHyhWWhb/Y3W2XjXZ4zSC1X+t7ihs3WPROGF6lBb25gfuyfKLlQLZ3nKdl8SlF2YuK+Ke6wmiS5Ui8b6W9Z5iKILzaixsmEXXYcoulAt3cDUbj+qMGkWdn8iRld4+KhCtWk+D5tXqUomj35nFV1ovpqFpROjZvv5PMuL1gcWXZjs5o2r1P2y8ue31rR1gU52oZk6Q7Sreogqf38GWrclyi5MZvVbvh47X/T3pmPrFIUXquPtdap1/Tea2ruqbVMUXniO0Ncx2s2k1uC8bdwyRemFiSryubVa2yz9dp+DzguP+4niC6vG4yr/Wp3Uk8CWCzWCwmoVyhj3W7+7s+HeFKMovPfPy8atsmWKkRa27k1pTjHOwpYJ3p1ilIUPdxe5U4yx8Mn2KWeKERY+3R9Wn2J8hS9sgKslRlf40g6/2ws1tsIXtzDeTDGywge3ibYpxlXYYRPqdYpRFb48wdspxlTYcRvx7xQjKuy8T1qn1SvmeAp7bAS/TDGawl473aspxlLYcyv/OTGJo7D3WYXzhRpFYafbhJt4/ZPgQj+nTQQX/scE4yj0dV5IbKG3A1FSC/2d+BJa6PFIm8xCn2f2RBZ6PZQosdDTbUJuoSq9HrqUV+h3ggILvR8Mllbo/+SzsMIAR7tlFYY4uy6qMMjhfEmF5hTi0wcEFU5Ofm8T4grtOsypbjmFaaCPjxBUGAiFFFL4jNkGL9wPPEP3EJd37g7q9ycuww5R22H7zmapDflZX7rXCVS/itV0HMp0VQwfeDm0HUpjBy4AAAAAAAAAAAAAAAAAAAAAAAAAAACAz/APOCY/FtgxKw4AAAAASUVORK5CYII=';

  // Product Categories (matching homepage)
  const categories = [
    { id: 'electronics', name: 'Electronics' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'books', name: 'Books' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'toys', name: 'Toys & Games' },
    { id: 'sports', name: 'Sports & Outdoors' },
    { id: 'food', name: 'Food & Grocery' },
    { id: 'beauty', name: 'Beauty & Health' },
    { id: 'automotive', name: 'Automotive' },
    { id: 'other', name: 'Other' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==================== IMAGE HANDLING FUNCTIONS ====================
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to server
  const uploadImage = async () => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.imageUrl;
    } catch (error) {
      setFormError('Error uploading image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // ==================== DATA FETCHING FUNCTIONS ====================
  // Fetch seller's products
  const fetchProducts = async () => {
    try {
      const response = await api.get('/seller/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== EVENT HANDLERS ====================
  // Handle form submission for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!formData.name || !formData.price || !formData.stockQuantity) {
      setFormError('Name, price, and stock quantity are required');
      return;
    }

    try {
      // Upload image if a new one was selected
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      if (editingProduct) {
        // Update existing product
        await api.put(`/seller/products/${editingProduct.id}`, {
          ...formData,
          imageUrl,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity)
        });
      } else {
        // Add new product
        await api.post('/seller/products', {
          ...formData,
          imageUrl,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity)
        });
      }
      
      // Reset form and refresh products
      resetForm();
      fetchProducts();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Error saving product');
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/seller/products/${id}`);
        fetchProducts();
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  // Start editing a product
  const startEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stock_quantity,
      imageUrl: product.image_url || '',
      category: product.category || 'other'
    });
    setImageFile(null);
    setImagePreview(product.image_url || '');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stockQuantity: '',
      imageUrl: '',
      category: 'other'
    });
    setEditingProduct(null);
    setShowAddForm(false);
    setFormError('');
    setImageFile(null);
    setImagePreview('');
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '20px' }}>Loading products...</div>
      </div>
    );
  }

  // ==================== MAIN PRODUCTS MANAGEMENT RENDER ====================
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        
        {/* ==================== HEADER SECTION ==================== */}
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#111827' }}>My Products</h1>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              {/* Add icon */}
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          )}
        </div>

        {/* ==================== ADD/EDIT PRODUCT FORM ==================== */}
        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#f9fafb', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
                {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
              </h2>
            </div>
            
            <div style={{ padding: '24px' }}>
              {/* Error message display */}
              {formError && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px'
                }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* ==================== BASIC PRODUCT INFO ==================== */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  {/* Product Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Wireless Headphones"
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

                  {/* Category */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="99.99"
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

                  {/* Stock Quantity */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      placeholder="10"
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

                {/* ==================== IMAGE UPLOAD SECTION ==================== */}
                {/* Image Upload Section */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Product Image
                  </label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
                    {/* File upload input */}
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        Upload an image or enter URL below
                      </p>
                    </div>
                    {/* Image preview */}
                    {(imagePreview || formData.imageUrl) && (
                      <img 
                        src={imagePreview || formData.imageUrl || DEFAULT_PRODUCT_IMAGE}
                        alt="Preview"
                        style={{
                          width: '96px',
                          height: '96px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}
                      />
                    )}
                  </div>
                  {/* URL input as alternative to file upload */}
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Or enter image URL: https://example.com/image.jpg"
                    style={{
                      width: '100%',
                      marginTop: '8px',
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

                {/* ==================== DESCRIPTION SECTION ==================== */}
                {/* Description */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your product..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '15px',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>

                {/* ==================== FORM BUTTONS ==================== */}
                {/* Form Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={uploadingImage}
                    style={{
                      backgroundColor: uploadingImage ? '#9ca3af' : '#2563eb',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: uploadingImage ? 'not-allowed' : 'pointer'
                    }}
                    onMouseOver={(e) => {
                      if (!uploadingImage) e.target.style.backgroundColor = '#1d4ed8';
                    }}
                    onMouseOut={(e) => {
                      if (!uploadingImage) e.target.style.backgroundColor = '#2563eb';
                    }}
                  >
                    {uploadingImage ? 'Uploading...' : (editingProduct ? 'Update Product' : 'Add Product')}
                  </button>
                  {/* Cancel button */}
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      padding: '10px 24px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#d1d5db'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== PRODUCTS GRID OR EMPTY STATE ==================== */}
        {/* Products Grid */}
        {products.length === 0 ? (
          // Empty state when no products exist
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '48px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            {/* Empty products icon */}
            <svg style={{ width: '96px', height: '96px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            {/* Empty state messaging */}
            <p style={{ fontSize: '20px', color: '#4b5563', marginBottom: '16px' }}>No products yet</p>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Start by adding your first product</p>
            {/* Call-to-action button */}
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '8px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div>
            {/* ==================== RESULTS HEADER ==================== */}
            {/* Results Header */}
            <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px 20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ color: '#6b7280' }}>
                Showing <span style={{ fontWeight: '600', color: '#111827' }}>{products.length}</span> products
              </p>
            </div>

            {/* ==================== PRODUCTS GRID ==================== */}
            {/* Products Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              {products.map((product) => (
                <div key={product.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
                >
                  {/* ==================== PRODUCT IMAGE ==================== */}
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
                    {/* Stock Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: product.stock_quantity > 10 ? '#d1fae5' : product.stock_quantity > 0 ? '#fef3c7' : '#fee2e2',
                      color: product.stock_quantity > 10 ? '#065f46' : product.stock_quantity > 0 ? '#92400e' : '#991b1b'
                    }}>
                      Stock: {product.stock_quantity}
                    </div>
                  </div>
                  
                  {/* ==================== PRODUCT DETAILS ==================== */}
                  {/* Product Details */}
                  <div style={{ padding: '16px' }}>
                    {/* Category label */}
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      {categories.find(c => c.id === product.category)?.name || 'Other'}
                    </p>
                    {/* Product name */}
                    <h3 style={{ fontWeight: '600', marginBottom: '8px', fontSize: '16px', color: '#111827' }}>
                      {product.name}
                    </h3>
                    
                    {/* Product Description */}
                    {product.description && (
                      <p style={{ 
                        fontSize: '13px', 
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
                    
                    {/* Product price */}
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>
                        ${product.price}
                      </span>
                    </div>
                    
                    {/* ==================== ACTION BUTTONS ==================== */}
                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Edit button */}
                      <button
                        onClick={() => startEdit(product)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: 'white',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                      >
                        Edit
                      </button>
                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          fontWeight: '500',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsManagement;