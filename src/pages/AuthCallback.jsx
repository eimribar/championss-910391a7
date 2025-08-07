import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Store token
      localStorage.setItem('auth_token', token);
      
      // Get user data to check onboarding status
      fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          // Redirect based on onboarding status
          if (data.user.onboardingCompleted) {
            navigate('/dashboard');
          } else {
            navigate('/onboarding');
          }
        } else {
          navigate('/auth?error=Failed to get user data');
        }
      })
      .catch(err => {
        console.error('Error fetching user:', err);
        navigate('/auth?error=Authentication failed');
      });
    } else {
      // No token, redirect to auth with error
      navigate('/auth?error=No authentication token received');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-400 mx-auto mb-4" />
        <p className="text-gray-400">Authenticating...</p>
      </div>
    </div>
  );
}