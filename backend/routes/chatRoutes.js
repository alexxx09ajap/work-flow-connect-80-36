
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

// Add users to a chat - Corregido el nombre de la función
router.post('/:chatId/users', chatController.addUsersToChatActions);

// Leave a chat
router.post('/:chatId/leave', chatController.leaveChat);

// Delete a chat
router.delete('/:chatId', chatController.deleteChat);

module.exports = router;
