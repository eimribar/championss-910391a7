const mongoose = require('mongoose');

const championSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide champion name']
  },
  linkedinUrl: {
    type: String,
    required: [true, 'Please provide LinkedIn URL'],
    match: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
      'Please provide a valid LinkedIn URL'
    ]
  },
  email: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: String,
  currentCompany: {
    type: String
  },
  currentTitle: {
    type: String
  },
  previousCompany: String,
  previousTitle: String,
  location: String,
  industry: String,
  profileImage: String,
  bio: String,
  
  // Job change tracking
  jobChangeStatus: {
    type: String,
    enum: ['monitoring', 'new_change_detected', 'changed', 'confirmed', 'no_change'],
    default: 'monitoring'
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  changeDetectedAt: Date,
  notifiedAt: Date,
  changeHistory: [{
    detectedAt: Date,
    previousCompany: String,
    previousTitle: String,
    newCompany: String,
    newTitle: String,
    confidence: Number
  }],
  
  // Monitoring settings
  monitoringActive: {
    type: Boolean,
    default: true
  },
  checkFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'weekly'
  },
  
  // Relationship data
  relationship: {
    type: String,
    enum: ['customer', 'prospect', 'partner', 'colleague', 'other'],
    default: 'prospect'
  },
  notes: String,
  tags: [String],
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Engagement tracking
  lastContactedAt: Date,
  engagementHistory: [{
    date: Date,
    type: String, // email, call, meeting, etc.
    notes: String
  }],
  
  // Additional metadata
  source: {
    type: String,
    enum: ['manual', 'csv', 'extension', 'api', 'integration'],
    default: 'manual'
  },
  enrichedData: {
    skills: [String],
    education: [{
      school: String,
      degree: String,
      field: String,
      startYear: Number,
      endYear: Number
    }],
    experience: [{
      company: String,
      title: String,
      startDate: Date,
      endDate: Date,
      description: String
    }]
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
championSchema.index({ user: 1, isDeleted: 1 });
championSchema.index({ user: 1, jobChangeStatus: 1 });
championSchema.index({ linkedinUrl: 1 });
championSchema.index({ user: 1, tags: 1 });

// Virtual for checking if job change is recent (within 30 days)
championSchema.virtual('isRecentJobChange').get(function() {
  if (!this.changeDetectedAt) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.changeDetectedAt > thirtyDaysAgo;
});

// Method to check if monitoring is due
championSchema.methods.isCheckDue = function() {
  if (!this.monitoringActive) return false;
  
  const now = new Date();
  const lastCheck = this.lastChecked || this.createdAt;
  const daysSinceLastCheck = Math.floor((now - lastCheck) / (1000 * 60 * 60 * 24));
  
  switch(this.checkFrequency) {
    case 'daily':
      return daysSinceLastCheck >= 1;
    case 'weekly':
      return daysSinceLastCheck >= 7;
    case 'monthly':
      return daysSinceLastCheck >= 30;
    default:
      return daysSinceLastCheck >= 7;
  }
};

// Method to record job change
championSchema.methods.recordJobChange = function(newCompany, newTitle, confidence = 0.8) {
  this.changeHistory.push({
    detectedAt: new Date(),
    previousCompany: this.currentCompany,
    previousTitle: this.currentTitle,
    newCompany,
    newTitle,
    confidence
  });
  
  this.previousCompany = this.currentCompany;
  this.previousTitle = this.currentTitle;
  this.currentCompany = newCompany;
  this.currentTitle = newTitle;
  this.jobChangeStatus = 'new_change_detected';
  this.changeDetectedAt = new Date();
  
  return this.save();
};

module.exports = mongoose.model('Champion', championSchema);