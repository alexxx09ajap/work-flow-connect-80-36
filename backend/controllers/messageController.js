
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
      const { chatId, text } = req.body;
      
      // Check if user is a participant
      const isParticipant = await chatModel.isParticipant(chatId, req.user.userId);
      if (!isParticipant) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
      }
      
      // Create message
      const message = await messageModel.create({
        chatId,
        senderId: req.user.userId,
        text
      });
      
      // Update last message in chat
      await chatModel.updateLastMessage(chatId, message.id);
      
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
      if (message.sender_id !== req.user.userId) {
        return res.status(403).json({ message: 'You can only edit your own messages' });
      }
      
      // Check if the message has a file (don't allow editing file messages)
      if (message.file_id) {
        return res.status(400).json({ message: 'Cannot edit messages with files' });
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
      if (message.sender_id !== req.user.userId) {
        return res.status(403).json({ message: 'You can only delete your own messages' });
      }
      
      // If message has a file, delete the file too
      if (message.file_id) {
        await fileModel.delete(message.file_id);
      }
      
      // Delete message
      await messageModel.delete(messageId);
      
      // If this was the last message in the chat, update the chat
      const chat = await chatModel.findById(message.chat_id);
      
      if (chat && chat.last_message_id === parseInt(messageId)) {
        const lastMessage = await messageModel.getLastMessage(message.chat_id);
        await chatModel.updateLastMessage(message.chat_id, lastMessage ? lastMessage.id : null);
      }
      
      res.json({ message: 'Message deleted', messageId });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = messageController;
