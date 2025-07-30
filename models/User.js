const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['client', 'developer', 'admin'],
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  refreshToken: {
    type: String
  },
  
  // Developer-specific fields
  bio: {
    type: String,
    maxlength: 1000
  },
  skills: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    min: 0
  },
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'expert']
  },
  portfolio: {
    type: String
  },
  resume: {
    type: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  completedProjects: {
    type: Number,
    default: 0
  },
  
  // Client-specific fields
  company: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  
  // Stripe customer ID
  stripeCustomerId: {
    type: String
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate average rating
userSchema.methods.updateRating = async function() {
  const Rating = mongoose.model('Rating');
  const ratings = await Rating.find({ developer: this._id });
  
  if (ratings.length > 0) {
    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.rating = totalRating / ratings.length;
    this.totalRatings = ratings.length;
  }
  
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
