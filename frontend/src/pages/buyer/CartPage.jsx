import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();
  const [updatingItem, setUpdatingItem] = useState(null);

  // Handle quantity change
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItem(productId);
    await updateQuantity(productId, newQuantity);
    setUpdatingItem(null);
  };

  // Handle remove item
  const handleRemove = async (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      setUpdatingItem(productId);
      await removeFromCart(productId);
      setUpdatingItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading cart...</div>
      </div>
    );
  }

  // Empty cart
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <img
            src="https://static.thenounproject.com/png/1700378-200.png"
            alt="Empty cart"
            className="mx-auto mb-4"
            style={{ width: '400px', height: '400px', objectFit: 'cover' }}
          />

          <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
          <Link 
            to="/" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            {cart.items.map((item) => (
              <div key={item.product_id} className="p-6 border-b last:border-b-0">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Sold by: {item.store_name}</p>
                    
                    {/* Price */}
                    <div className="mt-2">
                      <span className="text-lg font-bold text-blue-600">${item.price}</span>
                      <span className="text-sm text-gray-500 ml-2">each</span>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex items-center gap-4 mt-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          disabled={updatingItem === item.product_id || item.quantity <= 1}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-x">
                          {updatingItem === item.product_id ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          disabled={updatingItem === item.product_id || item.quantity >= item.stock_quantity}
                          className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* Stock Info */}
                      <span className="text-sm text-gray-500">
                        {item.stock_quantity} available
                      </span>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        disabled={updatingItem === item.product_id}
                        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-xl font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.itemCount} items)</span>
                <span className="font-semibold">${cart.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Free</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold text-blue-600">${cart.total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Proceed to Checkout
            </button>

            <Link 
              to="/"
              className="block text-center mt-4 text-blue-600 hover:text-blue-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;