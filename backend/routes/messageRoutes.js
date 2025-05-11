
const express = require('express');
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get messages for a chat
router.get('/:chatId', messageController.getMessages);

// Send a message
router.post('/', messageController.sendMessage);

// Update a message
router.put('/:messageId', messageController.updateMessage);

// Delete a message
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
