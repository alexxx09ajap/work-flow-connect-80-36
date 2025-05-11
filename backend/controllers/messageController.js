
const messageModel = require('../models/messageModel');
const chatModel = require('../models/chatModel');
const fileModel = require('../models/fileModel');

const messageController = {
  // Get messages for a chat
  async getMessages(req, res) {
    try {
      const { chatId } = req.params;
      
      // Check if user is a participant
      const isParticipant = await chatModel.isParticipant(chatId, req.user.userId);
      if (!isParticipant) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
      }
      
      // Get messages
      const messages = await messageModel.findByChatId(chatId);
      
      // Mark messages as read
      await messageModel.markAsRead(chatId, req.user.userId);
      
      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Send a message
  async sendMessage(req, res) {
    try {
      const { chatId, content } = req.body;
      
      // Check if user is a participant
      const isParticipant = await chatModel.isParticipant(chatId, req.user.userId);
      if (!isParticipant) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
      }
      
      // Create message
      const message = await messageModel.create({
        chatId,
        senderId: req.user.userId,
        text: content
      });
      
      // Update last message in chat
      await chatModel.updateLastMessage(chatId);
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Update a message
  async updateMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { text } = req.body;
      
      // Get message
      const message = await messageModel.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Check if user is the sender
      if (message.userId !== req.user.userId) {
        return res.status(403).json({ message: 'You can only edit your own messages' });
      }
      
      // Update message
      const updatedMessage = await messageModel.update(messageId, text);
      
      res.json(updatedMessage);
    } catch (error) {
      console.error('Error updating message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Delete a message
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      
      // Get message
      const message = await messageModel.findById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      
      // Check if user is the sender
      if (message.userId !== req.user.userId) {
        return res.status(403).json({ message: 'You can only delete your own messages' });
      }
      
      // Delete message
      await messageModel.delete(messageId);
      
      // If this was the last message in the chat, update the chat
      const lastMessage = await messageModel.getLastMessage(message.chatId);
      await chatModel.updateLastMessage(message.chatId);
      
      res.json({ message: 'Message deleted', messageId });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = messageController;
