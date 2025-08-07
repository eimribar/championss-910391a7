const express = require('express');
const router = express.Router();
const { passport, isWorkEmail } = require('../config/passport');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Success redirect with token
const handleSuccessfulAuth = (req, res) => {
  const token = generateToken(req.user.id);
  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
};

// Error redirect
const handleAuthError = (req, res, error) => {
  const errorMessage = encodeURIComponent(error || 'Authentication failed');
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth?error=${errorMessage}`);
};

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/error' }),
  handleSuccessfulAuth
);

// @route   GET /api/auth/microsoft
// @desc    Initiate Microsoft OAuth
// @access  Public
router.get('/microsoft',
  passport.authenticate('microsoft', { 
    scope: ['user.read'],
    prompt: 'select_account'
  })
);

// @route   GET /api/auth/microsoft/callback
// @desc    Microsoft OAuth callback
// @access  Public
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: '/api/auth/error' }),
  handleSuccessfulAuth
);

// @route   GET /api/auth/error
// @desc    Authentication error handler
// @access  Public
router.get('/error', (req, res) => {
  const error = req.query.error || 'Authentication failed. Please use a work email address.';
  handleAuthError(req, res, error);
});

// @route   POST /api/auth/validate-email
// @desc    Validate if email is a work email
// @access  Public
router.post('/validate-email', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }

  const isValid = isWorkEmail(email);
  
  res.json({
    success: true,
    isWorkEmail: isValid,
    message: isValid 
      ? 'Valid work email' 
      : 'Personal email addresses are not allowed. Please use your work email.'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user from token
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    const { prisma } = require('../lib/supabase');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        company: user.company,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        onboardingCompleted: user.onboardingCompleted,
        role: user.role,
        subscription: {
          plan: user.subscriptionPlan,
          championsLimit: user.championsLimit,
          expiresAt: user.subscriptionExpiresAt
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user data'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Error logging out'
      });
    }
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

module.exports = router;