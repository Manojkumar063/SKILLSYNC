const express = require('express');
const { body } = require('express-validator');
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Apply to job (Developer only)
router.post('/job/:jobId', [
  auth,
  roleCheck(['developer']),
  body('coverLetter').trim().isLength({ min: 50 }).withMessage('Cover letter must be at least 50 characters'),
  body('proposedRate').isNumeric().withMessage('Proposed rate must be a number'),
  body('estimatedDuration').trim().isLength({ min: 1 }).withMessage('Estimated duration is required')
], applicationController.applyToJob);

// Get applications for a job (Client only)
router.get('/job/:jobId', [
  auth,
  roleCheck(['client'])
], applicationController.getJobApplications);

// Get developer's applications
router.get('/my-applications', [
  auth,
  roleCheck(['developer'])
], applicationController.getDeveloperApplications);

// Update application (Developer only)
router.put('/:id', [
  auth,
  roleCheck(['developer'])
], applicationController.updateApplication);

// Withdraw application (Developer only)
router.patch('/:id/withdraw', [
  auth,
  roleCheck(['developer'])
], applicationController.withdrawApplication);

module.exports = router;
