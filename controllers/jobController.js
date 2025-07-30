const { validationResult } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Create job (Client only)
exports.createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const job = new Job({
      ...req.body,
      client: req.user.id
    });
    
    await job.save();
    await job.populate('client', 'firstName lastName email company');
    
    res.status(201).json(job);
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all jobs with filters
exports.getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      experienceLevel,
      budgetType,
      minBudget,
      maxBudget,
      skills,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = { status: 'open' };
    
    // Apply filters
    if (category) query.category = category;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (budgetType) query.budgetType = budgetType;
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseFloat(minBudget);
      if (maxBudget) query.budget.$lte = parseFloat(maxBudget);
    }
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query.requiredSkills = { $in: skillsArray };
    }
    if (search) {
      query.$text = { $search: search };
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const jobs = await Job.find(query)
      .populate('client', 'firstName lastName company')
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
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('client', 'firstName lastName company email')
      .populate('hiredDeveloper', 'firstName lastName email rating')
      .populate({
        path: 'applications',
        populate: {
          path: 'developer',
          select: 'firstName lastName email rating skills'
        }
      });
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update job (Client only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update job that is not open' });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client', 'firstName lastName company');
    
    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete job (Client only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (job.status === 'in_progress') {
      return res.status(400).json({ message: 'Cannot delete job that is in progress' });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });
    
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get client's jobs
exports.getClientJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { client: req.user.id };
    if (status) query.status = status;
    
    const jobs = await Job.find(query)
      .populate('hiredDeveloper', 'firstName lastName email rating')
      .sort({ createdAt: -1 })
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
    console.error('Get client jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Hire developer (Client only)
exports.hireDeveloper = async (req, res) => {
  try {
    const { jobId, developerId } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open' });
    }
    
    const application = await Application.findOne({
      job: jobId,
      developer: developerId,
      status: 'pending'
    });
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Update job status and hired developer
    job.status = 'in_progress';
    job.hiredDeveloper = developerId;
    await job.save();
    
    // Update application status
    application.status = 'accepted';
    await application.save();
    
    // Reject other applications
    await Application.updateMany(
      { job: jobId, developer: { $ne: developerId } },
      { status: 'rejected' }
    );
    
    res.json({ message: 'Developer hired successfully' });
  } catch (error) {
    console.error('Hire developer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete job (Client only)
exports.completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (job.status !== 'in_progress') {
      return res.status(400).json({ message: 'Job is not in progress' });
    }
    
    job.status = 'completed';
    await job.save();
    
    // Update developer's completed projects count
    const developer = await User.findById(job.hiredDeveloper);
    if (developer) {
      developer.completedProjects += 1;
      await developer.save();
    }
    
    res.json({ message: 'Job completed successfully' });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
