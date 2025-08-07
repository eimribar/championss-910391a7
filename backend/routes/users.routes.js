const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// All routes are protected
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const { fullName, company, settings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        fullName,
        company,
        settings
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating profile'
    });
  }
});

// @route   PUT /api/users/onboarding
// @desc    Complete onboarding
// @access  Private
router.put('/onboarding', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        onboardingCompleted: true
      },
      {
        new: true
      }
    ).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error updating onboarding status'
    });
  }
});

module.exports = router;