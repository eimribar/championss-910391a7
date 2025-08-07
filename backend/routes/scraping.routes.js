const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Champion = require('../models/Champion');

// All routes are protected
router.use(protect);

// @route   POST /api/scraping/linkedin
// @desc    Scrape LinkedIn profile
// @access  Private
router.post('/linkedin', async (req, res) => {
  try {
    const { linkedinUrl } = req.body;
    
    if (!linkedinUrl || !linkedinUrl.includes('linkedin.com/in/')) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid LinkedIn URL'
      });
    }
    
    // TODO: Implement actual LinkedIn scraping
    // For now, return mock data
    const mockData = {
      name: 'John Doe',
      currentCompany: 'Tech Corp',
      currentTitle: 'Senior Manager',
      location: 'San Francisco, CA',
      profileImage: 'https://via.placeholder.com/150',
      bio: 'Experienced professional in tech industry',
      linkedinUrl
    };
    
    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: 'Error scraping LinkedIn profile'
    });
  }
});

// @route   POST /api/scraping/check-changes
// @desc    Check for job changes for all champions
// @access  Private
router.post('/check-changes', async (req, res) => {
  try {
    const champions = await Champion.find({
      user: req.user.id,
      monitoringActive: true,
      isDeleted: false
    });
    
    let changesDetected = 0;
    const errors = [];
    
    for (const champion of champions) {
      if (!champion.isCheckDue()) {
        continue;
      }
      
      try {
        // TODO: Implement actual change detection
        // For now, simulate random changes for demo
        const hasChanged = Math.random() > 0.8;
        
        if (hasChanged) {
          await champion.recordJobChange(
            'New Company Inc',
            'New Position',
            0.85
          );
          changesDetected++;
        }
        
        champion.lastChecked = new Date();
        await champion.save();
      } catch (error) {
        errors.push({
          championId: champion._id,
          name: champion.name,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      checked: champions.length,
      changesDetected,
      errors
    });
  } catch (error) {
    console.error('Check changes error:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking for changes'
    });
  }
});

// @route   POST /api/scraping/enrich/:championId
// @desc    Enrich champion data
// @access  Private
router.post('/enrich/:championId', async (req, res) => {
  try {
    const champion = await Champion.findOne({
      _id: req.params.championId,
      user: req.user.id,
      isDeleted: false
    });
    
    if (!champion) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found'
      });
    }
    
    // TODO: Implement actual enrichment
    // For now, add mock enriched data
    champion.enrichedData = {
      skills: ['Leadership', 'Sales', 'Strategy'],
      education: [{
        school: 'University Example',
        degree: 'MBA',
        field: 'Business',
        startYear: 2010,
        endYear: 2012
      }],
      experience: [{
        company: champion.currentCompany,
        title: champion.currentTitle,
        startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        description: 'Current role'
      }]
    };
    
    await champion.save();
    
    res.json({
      success: true,
      champion
    });
  } catch (error) {
    console.error('Enrichment error:', error);
    res.status(500).json({
      success: false,
      error: 'Error enriching champion data'
    });
  }
});

module.exports = router;