const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

const router = express.Router();

// Get user profile
router.get('/profile/:id?', auth, userController.getProfile);

// Update user profile
router.put('/profile', auth, userController.updateProfile);

// Upload avatar
router.post('/avatar', [
  auth,
  upload.single('avatar')
], userController.uploadAvatar);

// Upload resume (Developer only)
router.post('/resume', [
  auth,
  roleCheck(['developer']),
  upload.single('resume')
], userController.uploadResume);

// Get all developers
router.get('/developers', userController.getDevelopers);

// Change password
router.put('/change-password', [
  auth,
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], userController.changePassword);

// Deactivate account
router.patch('/deactivate', auth, userController.deactivateAccount);

module.exports = router;
