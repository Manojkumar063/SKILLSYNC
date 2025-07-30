const express = require('express');
const { body } = require('express-validator');
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Create rating (Client only)
router.post('/', [
  auth,
  roleCheck(['client']),
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('developerId').isMongoId().withMessage('Invalid developer ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 1000 }).withMessage('Review must be less than 1000 characters')
], ratingController.createRating);

// Get ratings for developer
router.get('/developer/:developerId', ratingController.getDeveloperRatings);

// Get rating for specific job
router.get('/job/:jobId', ratingController.getJobRating);

// Update rating (Client only)
router.put('/:ratingId', [
  auth,
  roleCheck(['client'])
], ratingController.updateRating);

// Delete rating (Client only)
router.delete('/:ratingId', [
  auth,
  roleCheck(['client'])
], ratingController.deleteRating);

module.exports = router;
