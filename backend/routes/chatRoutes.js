
const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get all chats
router.get('/', chatController.getChats);

// Create private chat
router.post('/private', chatController.createPrivateChat);

// Create group chat
router.post('/group', chatController.createGroupChat);

// Add users to a chat
router.post('/:chatId/users', chatController.addUsersToChat);

// Leave a chat
router.post('/:chatId/leave', chatController.leaveChat);

// Delete a chat
router.delete('/:chatId', chatController.deleteChat);

// Mark messages as read
router.put('/:chatId/read', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.user;
    
    // Check if user is a participant
    const chatModel = require('../models/chatModel');
    const isParticipant = await chatModel.isParticipant(chatId, userId);
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }
    
    // Mark messages as read
    const messageModel = require('../models/messageModel');
    const updatedCount = await messageModel.markAsRead(chatId, userId);
    
    res.json({ success: true, updatedCount });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
