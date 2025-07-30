const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Rating = require('../models/Rating');
const Message = require('../models/Message');

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalDevelopers = await User.countDocuments({ role: 'developer' });
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const totalApplications = await Application.countDocuments();
    const totalRatings = await Rating.countDocuments();
    
    // Monthly user registrations
    const monthlyUsers = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Monthly job postings
    const monthlyJobs = await Job.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Top skills
    const topSkills = await Job.aggregate([
      { $unwind: '$requiredSkills' },
      {
        $group: {
          _id: '$requiredSkills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Revenue data (if payment integration is implemented)
    const revenueData = await Job.aggregate([
      { $match: { status: 'completed', paymentReleased: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$budget' },
          avgJobValue: { $avg: '$budget' }
        }
      }
    ]);
    
    res.json({
      overview: {
        totalUsers,
        totalClients,
        totalDevelopers,
        totalJobs,
        openJobs,
        completedJobs,
        totalApplications,
        totalRatings
      },
      charts: {
        monthlyUsers,
        monthlyJobs,
        topSkills
      },
      revenue: revenueData[0] || { totalRevenue: 0, avgJobValue: 0 }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users with pagination
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all jobs with pagination
exports.getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const jobs = await Job.find(query)
      .populate('client', 'firstName lastName email company')
      .populate('hiredDeveloper', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    
    // Delete related data
    if (user.role === 'client') {
      // Delete jobs posted by client
      const jobs = await Job.find({ client: userId });
      const jobIds = jobs.map(job => job._id);
      
      await Application.deleteMany({ job: { $in: jobIds } });
      await Message.deleteMany({ job: { $in: jobIds } });
      await Rating.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ client: userId });
    } else if (user.role === 'developer') {
      // Delete applications and ratings for developer
      await Application.deleteMany({ developer: userId });
      await Rating.deleteMany({ developer: userId });
      await Message.deleteMany({ 
        $or: [{ sender: userId }, { recipient: userId }] 
      });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Delete related data
    await Application.deleteMany({ job: jobId });
    await Message.deleteMany({ job: jobId });
    await Rating.deleteMany({ job: jobId });
    await Job.findByIdAndDelete(jobId);
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin users' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get platform statistics
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'developer' }),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'completed' }),
      Application.countDocuments(),
      Rating.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);
    
    const [clients, developers, openJobs, completedJobs, applications, avgRating] = stats;
    
    res.json({
      clients,
      developers,
      openJobs,
      completedJobs,
      applications,
      averageRating: avgRating[0]?.avgRating || 0
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
