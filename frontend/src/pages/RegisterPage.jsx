import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'buyer',
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    setError(''); 
    setLoading(true);

    const result = await register(formData); 
    
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
            backgroundColor: '#10b981', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: '24px'
          }}>
            <svg style={{ width: '40px', height: '40px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
              />
            </svg>
          </div>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '8px'
          }}>
            Create Account
          </h2>
          <p style={{ 
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Join our marketplace today
          </p>
        </div>
        
        {/* Registration Form Card */}
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
            
            {/* Full Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                placeholder="john@example.com"
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
            <div style={{ marginBottom: '20px' }}>
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
                placeholder="Minimum 6 characters"
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
            
            {/* Account Type Selection */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                I want to
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'buyer' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: formData.userType === 'buyer' ? '2px solid #2563eb' : '1px solid #d1d5db',
                    backgroundColor: formData.userType === 'buyer' ? '#eff6ff' : 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>🛍️</div>
                  <div style={{ fontWeight: '500', color: formData.userType === 'buyer' ? '#2563eb' : '#374151' }}>
                    Buy Products
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Shop online
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'seller' })}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: formData.userType === 'seller' ? '2px solid #2563eb' : '1px solid #d1d5db',
                    backgroundColor: formData.userType === 'seller' ? '#eff6ff' : 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏪</div>
                  <div style={{ fontWeight: '500', color: formData.userType === 'seller' ? '#2563eb' : '#374151' }}>
                    Sell Products
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    Start selling
                  </div>
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <input 
                  type="checkbox" 
                  required
                  style={{ marginRight: '8px', marginTop: '2px' }}
                />
                <span>
                  I agree to the{' '}
                  <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy Policy</a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
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
                if (!loading) e.target.style.backgroundColor = '#059669';
              }}
              onMouseOut={(e) => {
                if (!loading) e.target.style.backgroundColor = '#10b981';
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Sign in link */}
        <div style={{ 
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <p style={{ 
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#2563eb',
                fontWeight: '500',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;