const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Champion = require('../models/Champion');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// @route   GET /api/champions
// @desc    Get all champions for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { 
      jobChangeStatus, 
      relationship, 
      tags, 
      search,
      sortBy = '-createdAt',
      limit = 100,
      page = 1 
    } = req.query;
    
    // Build query
    const query = { 
      user: req.user.id,
      isDeleted: false 
    };
    
    if (jobChangeStatus) {
      query.jobChangeStatus = jobChangeStatus;
    }
    
    if (relationship) {
      query.relationship = relationship;
    }
    
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { currentCompany: { $regex: search, $options: 'i' } },
        { currentTitle: { $regex: search, $options: 'i' } }
      ];
    }
    
    const champions = await Champion.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Champion.countDocuments(query);
    
    res.json({
      success: true,
      count,
      champions,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get champions error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching champions'
    });
  }
});

// @route   GET /api/champions/stats
// @desc    Get champion statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const stats = await Champion.aggregate([
      { $match: { user: req.user._id, isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          monitoring: { 
            $sum: { $cond: [{ $eq: ['$jobChangeStatus', 'monitoring'] }, 1, 0] }
          },
          changed: { 
            $sum: { 
              $cond: [
                { $in: ['$jobChangeStatus', ['new_change_detected', 'changed', 'confirmed']] }, 
                1, 
                0
              ] 
            }
          },
          recentChanges: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$changeDetectedAt', null] },
                    { 
                      $gte: [
                        '$changeDetectedAt', 
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ]
                    }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: stats[0] || { total: 0, monitoring: 0, changed: 0, recentChanges: 0 }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching statistics'
    });
  }
});

// @route   GET /api/champions/:id
// @desc    Get single champion
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const champion = await Champion.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });
    
    if (!champion) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found'
      });
    }
    
    res.json({
      success: true,
      champion
    });
  } catch (error) {
    console.error('Get champion error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching champion'
    });
  }
});

// @route   POST /api/champions
// @desc    Create new champion
// @access  Private
router.post('/', [
  body('name').notEmpty().trim(),
  body('linkedinUrl').isURL().matches(/linkedin\.com\/in\//),
  body('email').optional().isEmail().normalizeEmail(),
  handleValidationErrors
], async (req, res) => {
  try {
    // Check if champion already exists for this user
    const existingChampion = await Champion.findOne({
      user: req.user.id,
      linkedinUrl: req.body.linkedinUrl,
      isDeleted: false
    });
    
    if (existingChampion) {
      return res.status(400).json({
        success: false,
        error: 'You are already tracking this champion'
      });
    }
    
    // Check user's champion limit
    const championCount = await Champion.countDocuments({
      user: req.user.id,
      isDeleted: false
    });
    
    if (championCount >= req.user.subscription.championsLimit) {
      return res.status(403).json({
        success: false,
        error: `You have reached your champion limit of ${req.user.subscription.championsLimit}. Please upgrade your plan.`
      });
    }
    
    const champion = await Champion.create({
      ...req.body,
      user: req.user.id
    });
    
    res.status(201).json({
      success: true,
      champion
    });
  } catch (error) {
    console.error('Create champion error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating champion'
    });
  }
});

// @route   PUT /api/champions/:id
// @desc    Update champion
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const champion = await Champion.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        isDeleted: false
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!champion) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found'
      });
    }
    
    res.json({
      success: true,
      champion
    });
  } catch (error) {
    console.error('Update champion error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating champion'
    });
  }
});

// @route   DELETE /api/champions/:id
// @desc    Delete champion (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const champion = await Champion.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        isDeleted: false
      },
      {
        isDeleted: true,
        deletedAt: new Date()
      },
      {
        new: true
      }
    );
    
    if (!champion) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Champion deleted successfully'
    });
  } catch (error) {
    console.error('Delete champion error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting champion'
    });
  }
});

// @route   POST /api/champions/bulk
// @desc    Bulk create champions from CSV
// @access  Private
router.post('/bulk', async (req, res) => {
  try {
    const { champions } = req.body;
    
    if (!champions || !Array.isArray(champions)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of champions'
      });
    }
    
    // Check limit
    const currentCount = await Champion.countDocuments({
      user: req.user.id,
      isDeleted: false
    });
    
    if (currentCount + champions.length > req.user.subscription.championsLimit) {
      return res.status(403).json({
        success: false,
        error: `Adding ${champions.length} champions would exceed your limit of ${req.user.subscription.championsLimit}`
      });
    }
    
    // Process champions
    const results = {
      created: [],
      skipped: [],
      errors: []
    };
    
    for (const championData of champions) {
      try {
        // Check if already exists
        const exists = await Champion.findOne({
          user: req.user.id,
          linkedinUrl: championData.linkedinUrl,
          isDeleted: false
        });
        
        if (exists) {
          results.skipped.push({
            name: championData.name,
            reason: 'Already tracking'
          });
          continue;
        }
        
        const champion = await Champion.create({
          ...championData,
          user: req.user.id,
          source: 'csv'
        });
        
        results.created.push(champion);
      } catch (error) {
        results.errors.push({
          name: championData.name,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing bulk upload'
    });
  }
});

module.exports = router;