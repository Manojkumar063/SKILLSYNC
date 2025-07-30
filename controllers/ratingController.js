const Rating = require('../models/Rating');
const Job = require('../models/Job');
const User = require('../models/User');

// Create rating (Client only)
exports.createRating = async (req, res) => {
  try {
    const { jobId, developerId, rating, review, categories } = req.body;
    
    // Verify job exists and is completed
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only job client can rate' });
    }
    
    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed jobs' });
    }
    
    if (job.hiredDeveloper.toString() !== developerId) {
      return res.status(400).json({ message: 'Developer was not hired for this job' });
    }
    
    // Check if rating already exists
    const existingRating = await Rating.findOne({ job: jobId });
    if (existingRating) {
      return res.status(400).json({ message: 'Job already rated' });
    }
    
    const newRating = new Rating({
      job: jobId,
      client: req.user.id,
      developer: developerId,
      rating,
      review,
      categories
    });
    
    await newRating.save();
    
    // Update developer's rating
    const developer = await User.findById(developerId);
    await developer.updateRating();
    
    await newRating.populate('client', 'firstName lastName');
    
    res.status(201).json(newRating);
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get ratings for developer
exports.getDeveloperRatings = async (req, res) => {
  try {
    const { developerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const ratings = await Rating.find({ developer: developerId })
      .populate('client', 'firstName lastName')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Rating.countDocuments({ developer: developerId });
    
    // Calculate rating statistics
    const stats = await Rating.aggregate([
      { $match: { developer: mongoose.Types.ObjectId(developerId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          },
          averageCategories: {
            $avg: {
              communication: '$categories.communication',
              quality: '$categories.quality',
              timeliness: '$categories.timeliness'
            }
          }
        }
      }
    ]);
    
    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error('Get developer ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get rating for specific job
exports.getJobRating = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const rating = await Rating.findOne({ job: jobId })
      .populate('client', 'firstName lastName')
      .populate('developer', 'firstName lastName');
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    res.json(rating);
  } catch (error) {
    console.error('Get job rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update rating (Client only)
exports.updateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    if (rating.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedRating = await Rating.findByIdAndUpdate(
      ratingId,
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'firstName lastName');
    
    // Update developer's rating
    const developer = await User.findById(rating.developer);
    await developer.updateRating();
    
    res.json(updatedRating);
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete rating (Client only)
exports.deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    if (rating.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const developerId = rating.developer;
    await Rating.findByIdAndDelete(ratingId);
    
    // Update developer's rating
    const developer = await User.findById(developerId);
    await developer.updateRating();
    
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
