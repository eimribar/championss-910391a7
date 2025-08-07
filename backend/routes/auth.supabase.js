const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma, supabase } = require('../lib/supabase');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password, fullName, company } = req.body;
    
    // Check if we're using Supabase or local auth
    if (supabase && process.env.SKIP_DB !== 'true') {
      // Use Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company
          }
        }
      });
      
      if (authError) {
        return res.status(400).json({
          success: false,
          error: authError.message
        });
      }
      
      // Create user in database
      const user = await prisma.user.create({
        data: {
          id: authData.user.id,
          email,
          fullName,
          company
        }
      });
      
      return res.status(201).json({
        success: true,
        token: authData.session?.access_token || generateToken(user.id),
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          company: user.company,
          onboardingCompleted: user.onboardingCompleted
        }
      });
    } else {
      // Fallback to local auth
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          company
        }
      });
      
      // Generate token
      const token = generateToken(user.id);
      
      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          company: user.company,
          onboardingCompleted: user.onboardingCompleted
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating user'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
], async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (supabase && process.env.SKIP_DB !== 'true') {
      // Use Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: authData.user.id }
      });
      
      if (!user) {
        // Create user if doesn't exist (for Supabase users created outside our app)
        const newUser = await prisma.user.create({
          data: {
            id: authData.user.id,
            email: authData.user.email,
            fullName: authData.user.user_metadata?.full_name || email.split('@')[0],
            company: authData.user.user_metadata?.company
          }
        });
        
        return res.json({
          success: true,
          token: authData.session.access_token,
          user: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            company: newUser.company,
            onboardingCompleted: newUser.onboardingCompleted
          }
        });
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
      
      res.json({
        success: true,
        token: authData.session.access_token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          company: user.company,
          onboardingCompleted: user.onboardingCompleted,
          role: user.role
        }
      });
    } else {
      // Fallback to local auth
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user || !user.password) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
      
      // Generate token
      const token = generateToken(user.id);
      
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          company: user.company,
          onboardingCompleted: user.onboardingCompleted,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging in'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    let userId;
    
    if (supabase && process.env.SKIP_DB !== 'true') {
      // Verify with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        // Try local JWT verification
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.id;
        } catch {
          return res.status(401).json({
            success: false,
            error: 'Invalid token'
          });
        }
      } else {
        userId = user.id;
      }
    } else {
      // Local JWT verification
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      }
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
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
        onboardingCompleted: user.onboardingCompleted,
        role: user.role,
        subscription: {
          plan: user.subscriptionPlan,
          championsLimit: user.championsLimit,
          expiresAt: user.subscriptionExpiresAt
        },
        settings: {
          emailNotifications: user.emailNotifications,
          weeklyDigest: user.weeklyDigest,
          instantAlerts: user.instantAlerts
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
router.post('/logout', async (req, res) => {
  try {
    if (supabase && process.env.SKIP_DB !== 'true') {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        await supabase.auth.admin.signOut(token);
      }
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
});

module.exports = router;