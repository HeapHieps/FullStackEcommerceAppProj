import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isBuyer } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart when user logs in as buyer
  useEffect(() => {
    if (isBuyer) {
      fetchCart();
    } else {
      // Clear cart if not a buyer
      setCart({ items: [], total: 0, itemCount: 0 });
    }
  }, [user, isBuyer]);

  // Fetch cart from backend
  const fetchCart = async () => {
    if (!isBuyer) return;
    
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
      setError(null);
    } catch (err) {
      console.error('Cart fetch error:', err);
      // If error is 401, user is not logged in - that's ok
      if (err.response?.status !== 401) {
        setError('Failed to fetch cart');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isBuyer) {
      alert('Please login as a buyer to add items to cart');
      return { success: false, error: 'Not logged in as buyer' };
    }

    try {
      setLoading(true);
      await api.post('/cart', { productId, quantity });
      await fetchCart(); // Refresh cart
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      setError(message);
      alert(message); // Show error to user
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      await api.put(`/cart/${productId}`, { quantity });
      await fetchCart(); // Refresh cart
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update cart';
      setError(message);
      alert(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      await api.delete(`/cart/${productId}`);
      await fetchCart(); // Refresh cart
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove from cart';
      setError(message);
      alert(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Clear cart (after successful checkout)
  const clearCart = () => {
    setCart({ items: [], total: 0, itemCount: 0 });
  };

  // Get total number of items in cart
  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if a product is in cart
  const isInCart = (productId) => {
    return cart.items.some(item => item.product_id === productId);
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    cartItemCount: getCartItemCount(),
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};