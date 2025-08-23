import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

// Create a context to hold user authentication info
// This will be used to provide user data to all components
const AuthContext = createContext(null);

// Custom hook to access the AuthContext easily
// This allows any component to get user info without needing to useContext directly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// This wraps your entire app and provides user info to all components
export const AuthProvider = ({ children }) => {
  // State to store the current user (null = not logged in)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When app first loads, check if user was previously logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // User was logged in before, restore their session
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Function to handle login
  const login = async (email, password) => {
    try {
      // Send login request to your backend
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Save token and user info to browser storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Function to handle registration
  const register = async (userData) => {
    try {
      // Send registration request to your backend
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Save token and user info (auto-login after registration)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // Function to handle logout
  const logout = () => {
    // Clear everything - user is signed out
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // These are all the values/functions that ANY component can access
  return (
    <AuthContext.Provider value={{
      user,                              // Current user object
      loading,                           // Is app still checking for user?
      login,                             // Function to log in
      register,                          // Function to register
      logout,                            // Function to log out
      isAuthenticated: !!user,          // Is someone logged in?
      isSeller: user?.user_type === 'seller',  // Is the user a seller?
      isBuyer: user?.user_type === 'buyer',    // Is the user a buyer?
    }}>
      {children}
    </AuthContext.Provider>
  );
};