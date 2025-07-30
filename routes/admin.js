const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// All routes require admin authentication
router.use(auth);
router.use(roleCheck(['admin']));

// Get dashboard analytics
router.get('/analytics', adminController.getDashboardAnalytics);

// Get all users with pagination
router.get('/users', adminController.getAllUsers);

// Get all jobs with pagination
router.get('/jobs', adminController.getAllJobs);

// Delete user
router.delete('/users/:userId', adminController.deleteUser);

// Delete job
router.delete('/jobs/:jobId', adminController.deleteJob);

// Toggle user active status
router.patch('/users/:userId/toggle-status', adminController.toggleUserStatus);

// Get platform statistics
router.get('/statistics', adminController.getStatistics);

module.exports = router;
