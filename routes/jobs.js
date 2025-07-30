const express = require('express');
const { body } = require('express-validator');
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Create job (Client only)
router.post('/', [
  auth,
  roleCheck(['client']),
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 50 }).withMessage('Description must be at least 50 characters'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
  body('budgetType').isIn(['fixed', 'hourly']).withMessage('Budget type must be fixed or hourly'),
  body('deadline').isISO8601().withMessage('Deadline must be a valid date'),
  body('category').isIn(['web-development', 'mobile-development', 'desktop-development', 'api-development', 'database', 'devops', 'other']).withMessage('Invalid category'),
  body('experienceLevel').isIn(['beginner', 'intermediate', 'expert']).withMessage('Invalid experience level')
], jobController.createJob);

// Get all jobs
router.get('/', jobController.getJobs);

// Get job by ID
router.get('/:id', jobController.getJobById);

// Update job (Client only)
router.put('/:id', [
  auth,
  roleCheck(['client'])
], jobController.updateJob);

// Delete job (Client only)
router.delete('/:id', [
  auth,
  roleCheck(['client'])
], jobController.deleteJob);

// Get client's jobs
router.get('/client/my-jobs', [
  auth,
  roleCheck(['client'])
], jobController.getClientJobs);

// Hire developer (Client only)
router.post('/hire', [
  auth,
  roleCheck(['client']),
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('developerId').isMongoId().withMessage('Invalid developer ID')
], jobController.hireDeveloper);

// Complete job (Client only)
router.patch('/:id/complete', [
  auth,
  roleCheck(['client'])
], jobController.completeJob);

module.exports = router;
