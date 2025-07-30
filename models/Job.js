const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  budgetType: {
    type: String,
    enum: ['fixed', 'hourly'],
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert'],
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  hiredDeveloper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: String,
    enum: ['web-development', 'mobile-development', 'desktop-development', 'api-development', 'database', 'devops', 'other'],
    required: true
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  estimatedDuration: {
    type: String,
    enum: ['less-than-1-week', '1-2-weeks', '2-4-weeks', '1-2-months', 'more-than-2-months']
  },
  paymentReleased: {
    type: Boolean,
    default: false
  },
  stripePaymentIntentId: {
    type: String
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
