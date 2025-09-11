import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%'
      }}>
        {/* Logo/Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: '#2563eb', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: '24px'
          }}>
            <svg style={{ width: '40px', height: '40px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8m0-8L14.707 15.293c-.63.63-.184 1.707.707 1.707H17" 
              />
            </svg>
          </div>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '8px'
          }}>
            Welcome Back
          </h2>
          <p style={{ 
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Sign in to your account to continue
          </p>
        </div>
        
        {/* Login Form Card */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '32px'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Error message */}
            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#991b1b',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            
            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Remember me & Forgot password */}
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox" 
                  style={{ marginRight: '8px' }}
                />
                Remember me
              </label>
              <a 
                href="#" 
                style={{ 
                  fontSize: '14px',
                  color: '#2563eb',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.target.style.backgroundColor = '#1d4ed8';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.backgroundColor = '#2563eb';
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <div style={{ 
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <p style={{ 
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#2563eb',
                fontWeight: '500',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;