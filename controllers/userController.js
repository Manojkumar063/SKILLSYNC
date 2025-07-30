const User = require('../models/User');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs').promises;

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user.id)
      .select('-password -refreshToken')
      .populate('completedProjects');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    // Remove sensitive fields from updates
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.refreshToken;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, '..', user.avatar);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.log('Old avatar file not found');
      }
    }
    
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.json({
      message: 'Avatar uploaded successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload resume (Developer only)
exports.uploadResume = async (req, res) => {
  try {
    if (req.user.role !== 'developer') {
      return res.status(403).json({ message: 'Only developers can upload resume' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const user = await User.findById(req.user.id);
    
    // Delete old resume if exists
    if (user.resume) {
      const oldPath = path.join(__dirname, '..', user.resume);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.log('Old resume file not found');
      }
    }
    
    user.resume = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.json({
      message: 'Resume uploaded successfully',
      resume: user.resume
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all developers with filters
exports.getDevelopers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      skills,
      experience,
      minRate,
      maxRate,
      minRating,
      search,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { role: 'developer', isActive: true };
    
    // Apply filters
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.skills = { $in: skillsArray };
    }
    if (experience) query.experience = experience;
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseFloat(minRate);
      if (maxRate) query.hourlyRate.$lte = parseFloat(maxRate);
    }
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const developers = await User.find(query)
      .select('-password -refreshToken -email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      developers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get developers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Deactivate account
exports.deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
