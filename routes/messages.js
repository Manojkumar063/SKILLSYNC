const express = require('express');
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Send message
router.post('/', [
  auth,
  upload.array('attachments', 5),
  body('recipientId').isMongoId().withMessage('Invalid recipient ID'),
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('content').trim().isLength({ min: 1 }).withMessage('Message content is required')
], messageController.sendMessage);

// Get messages for a job
router.get('/job/:jobId', auth, messageController.getJobMessages);

// Get conversations
router.get('/conversations', auth, messageController.getConversations);

// Mark message as read
router.patch('/:messageId/read', auth, messageController.markAsRead);

// Get unread messages count
router.get('/unread-count', auth, messageController.getUnreadCount);

module.exports = router;
