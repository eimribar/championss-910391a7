import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LogoWithText } from '@/components/ui/logo';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [isHoveringGoogle, setIsHoveringGoogle] = useState(false);
  const [isHoveringMicrosoft, setIsHoveringMicrosoft] = useState(false);
  
  useEffect(() => {
    // Check for error in URL params
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const decodedError = decodeURIComponent(errorParam);
      // Only show work email error if it's that specific error
      if (decodedError.includes('Personal email')) {
        setError('Please use your work email address');
      } else {
        setError('Authentication failed. Please try again.');
      }
      // Clear error after 5 seconds
      setTimeout(() => setError(''), 5000);
    }
    
    // Check for token in URL params (from OAuth callback)
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleMicrosoftLogin = () => {
    window.location.href = `${API_URL}/api/auth/microsoft`;
  };

  return (
    <>
      <style>{`
        /* Force reset ALL spacing */
        * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        
        html {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
        }
        
        #root {
          margin: 0 !important;
          padding: 0 !important;
          position: relative !important;
        }
        
        /* Ensure nav is at absolute top */
        .top-nav {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
          z-index: 9999 !important;
          height: 56px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        /* Fix any potential spacing in nav content */
        .top-nav > * {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        
        /* Ensure main content doesn't hide under nav */
        .main-content {
          padding-top: 56px;
          min-height: 100vh;
          background: black;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .slide-down {
          animation: slideDown 0.3s ease-out;
        }
        
        .auth-container {
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 48px !important;
          min-width: 400px;
          margin: 0 !important;
        }
        
        .auth-button {
          position: relative;
          width: 100%;
          height: 48px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 0 16px !important;
          margin: 0 !important;
        }
        
        .auth-button:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px 16px !important;
          border-radius: 6px;
          font-size: 14px;
          margin: 0 0 24px 0 !important;
          animation: slideDown 0.3s ease-out;
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s ease;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .nav-link:hover {
          color: rgba(255, 255, 255, 0.9);
        }
        
        /* Restore specific paddings where needed */
        .nav-content {
          padding: 0 32px !important;
          height: 56px;
          display: flex;
          align-items: center;
          margin: 0 !important;
        }
        
        .auth-container > *:not(:last-child) {
          margin-bottom: 24px !important;
        }
        
        .button-group {
          margin: 0 !important;
        }
        
        .button-group > *:not(:last-child) {
          margin-bottom: 12px !important;
        }
      `}</style>

      {/* Navigation Bar - Absolutely positioned at top */}
      <nav className="top-nav">
        <div className="nav-content">
          <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
              <LogoWithText className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
            </Link>
            <Link to="/" className="nav-link">
              Back to home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <div className="auth-container fade-in">
            {/* Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 32px 0' }}>
              <LogoWithText className="h-12 opacity-70" />
            </div>
            
            {/* Heading */}
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 'normal', textAlign: 'center', margin: '0 0 32px 0' }}>
              Welcome back
            </h1>
            
            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            {/* SSO Buttons */}
            <div className="button-group">
              <button
                className="auth-button"
                onClick={handleGoogleLogin}
                onMouseEnter={() => setIsHoveringGoogle(true)}
                onMouseLeave={() => setIsHoveringGoogle(false)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path 
                    fill={isHoveringGoogle ? "#4285F4" : "rgba(255,255,255,0.7)"} 
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path 
                    fill={isHoveringGoogle ? "#34A853" : "rgba(255,255,255,0.7)"} 
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path 
                    fill={isHoveringGoogle ? "#FBBC05" : "rgba(255,255,255,0.7)"} 
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path 
                    fill={isHoveringGoogle ? "#EA4335" : "rgba(255,255,255,0.7)"} 
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>

              <button
                className="auth-button"
                onClick={handleMicrosoftLogin}
                onMouseEnter={() => setIsHoveringMicrosoft(true)}
                onMouseLeave={() => setIsHoveringMicrosoft(false)}
              >
                <svg className="w-5 h-5" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill={isHoveringMicrosoft ? "#f25022" : "rgba(255,255,255,0.7)"}/>
                  <rect x="1" y="11" width="9" height="9" fill={isHoveringMicrosoft ? "#00a4ef" : "rgba(255,255,255,0.7)"}/>
                  <rect x="11" y="1" width="9" height="9" fill={isHoveringMicrosoft ? "#7fba00" : "rgba(255,255,255,0.7)"}/>
                  <rect x="11" y="11" width="9" height="9" fill={isHoveringMicrosoft ? "#ffb900" : "rgba(255,255,255,0.7)"}/>
                </svg>
                Continue with Microsoft
              </button>
            </div>
            
            {/* Terms */}
            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', margin: '32px 0 0 0' }}>
              By continuing, you agree to our Terms and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </>
  );
}