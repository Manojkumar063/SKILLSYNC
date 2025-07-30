const Message = require('../models/Message');
const Job = require('../models/Job');
const User = require('../models/User');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, jobId, content } = req.body;
    
    // Verify job exists and user has access
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user is involved in the job
    const isClient = job.client.toString() === req.user.id;
    const isDeveloper = job.hiredDeveloper && job.hiredDeveloper.toString() === req.user.id;
    
    if (!isClient && !isDeveloper) {
      return res.status(403).json({ message: 'Not authorized to message about this job' });
    }
    
    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      job: jobId,
      content,
      attachments: req.files ? req.files.map(file => ({
        filename: file.originalname,
        url: `/uploads/${file.filename}`
      })) : []
    });
    
    await message.save();
    await message.populate('sender', 'firstName lastName avatar');
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a job
exports.getJobMessages = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verify job exists and user has access
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    const isClient = job.client.toString() === req.user.id;
    const isDeveloper = job.hiredDeveloper && job.hiredDeveloper.toString() === req.user.id;
    
    if (!isClient && !isDeveloper) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const query = {
      job: jobId,
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ]
    };
    
    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName avatar')
      .populate('recipient', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Message.countDocuments(query);
    
    // Mark messages as read
    await Message.updateMany(
      { recipient: req.user.id, job: jobId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    
    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversations
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            job: '$job',
            participants: {
              $cond: {
                if: { $eq: ['$sender', req.user._id] },
                then: ['$sender', '$recipient'],
                else: ['$recipient', '$sender']
              }
            }
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id.job',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.recipient',
          foreignField: '_id',
          as: 'recipient'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);
    
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findOneAndUpdate(
      { _id: messageId, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      isRead: false
    });
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
