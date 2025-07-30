const { validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Apply to job (Developer only)
exports.applyToJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const jobId = req.params.jobId;
    const developerId = req.user.id;
    
    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for applications' });
    }
    
    // Check if developer already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      developer: developerId
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }
    
    // Create application
    const application = new Application({
      job: jobId,
      developer: developerId,
      ...req.body
    });
    
    await application.save();
    
    // Add application to job
    job.applications.push(application._id);
    await job.save();
    
    await application.populate('developer', 'firstName lastName email rating skills');
    
    res.status(201).json(application);
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get applications for a job (Client only)
exports.getJobApplications = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    
    // Check if job exists and user is the client
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const applications = await Application.find({ job: jobId })
      .populate('developer', 'firstName lastName email rating skills completedProjects')
      .sort({ createdAt: -1 });
    
    res.json(applications);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get developer's applications
exports.getDeveloperApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { developer: req.user.id };
    if (status) query.status = status;
    
    const applications = await Application.find(query)
      .populate('job', 'title budget budgetType deadline client')
      .populate('job.client', 'firstName lastName company')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Application.countDocuments(query);
    
    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get developer applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update application (Developer only)
exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    if (application.developer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update application that is not pending' });
    }
    
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('developer', 'firstName lastName email rating skills');
    
    res.json(updatedApplication);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Withdraw application (Developer only)
exports.withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    if (application.developer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw application that is not pending' });
    }
    
    application.status = 'withdrawn';
    await application.save();
    
    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
