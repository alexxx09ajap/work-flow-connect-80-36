
const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');

const chatController = {
  // Get all chats for a user
  async getChats(req, res) {
    try {
      const chats = await chatModel.findByUserId(req.user.userId);
      
      // For each chat, get participants and last message
      const populatedChats = [];
      
      for (const chat of chats) {
        try {
          const participants = await chatModel.getParticipants(chat.id);
          
          let lastMessage = null;
          if (chat.last_message_id) {
            lastMessage = await messageModel.findById(chat.last_message_id);
          }
          
          populatedChats.push({
            ...chat,
            participants,
            lastMessage
          });
        } catch (err) {
          console.error(`Error processing chat ${chat.id}:`, err);
          // Continue with other chats even if one fails
        }
      }
      
      res.json(populatedChats);
    } catch (error) {
      console.error('Error getting chats:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Create a private chat
  async createPrivateChat(req, res) {
    try {
      const { userId } = req.body;
      
      if (userId === req.user.userId) {
        return res.status(400).json({ message: 'Cannot create chat with yourself' });
      }
      
      const chatId = await chatModel.createPrivateChat([req.user.userId, userId]);
      
      // Get the chat with participants
      const chat = await chatModel.findById(chatId);
      const participants = await chatModel.getParticipants(chatId);
      
      res.status(201).json({
        ...chat,
        participants
      });
    } catch (error) {
      console.error('Error creating private chat:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Create a group chat
  async createGroupChat(req, res) {
    try {
      const { name, participants } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Group name is required' });
      }
      
      if (!participants || !participants.length) {
        return res.status(400).json({ message: 'At least one participant is required' });
      }
      
      // Add current user to participants if not included
      const allParticipants = new Set([req.user.userId, ...participants]);
      
      const chatId = await chatModel.createGroupChat(
        name, 
        [...allParticipants], 
        req.user.userId
      );
      
      // Get the chat with participants
      const chat = await chatModel.findById(chatId);
      const chatParticipants = await chatModel.getParticipants(chatId);
      
      res.status(201).json({
        ...chat,
        participants: chatParticipants
      });
    } catch (error) {
      console.error('Error creating group chat:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Add users to a group chat
  async addUsersToChat(req, res) {
    try {
      const { chatId } = req.params;
      const { userIds } = req.body;
      
      if (!userIds || !userIds.length) {
        return res.status(400).json({ message: 'No users provided to add' });
      }
      
      // Check if chat exists
      const chat = await chatModel.findById(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      // Check if it's a group chat
      if (!chat.isGroup) {
        return res.status(400).json({ message: 'Can only add users to group chats' });
      }
      
      // Check if user is a participant
      const isParticipant = await chatModel.isParticipant(chatId, req.user.userId);
      if (!isParticipant) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
      }
      
      // Add each user
      for (const userId of userIds) {
        await chatModel.addParticipant(chatId, userId);
      }
      
      // Get updated chat data
      const participants = await chatModel.getParticipants(chatId);
      
      res.json({
        ...chat,
        participants
      });
    } catch (error) {
      console.error('Error adding users to chat:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Leave a group chat
  async leaveChat(req, res) {
    try {
      const { chatId } = req.params;
      
      // Check if chat exists
      const chat = await chatModel.findById(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      // Check if it's a group chat
      if (!chat.isGroup) {
        return res.status(400).json({ message: 'Can only leave group chats' });
      }
      
      // Check if user is a participant
      const isParticipant = await chatModel.isParticipant(chatId, req.user.userId);
      if (!isParticipant) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
      }
      
      // Remove user from chat
      await chatModel.removeParticipant(chatId, req.user.userId);
      
      res.json({ message: 'Successfully left the chat' });
    } catch (error) {
      console.error('Error leaving chat:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Delete a chat
  async deleteChat(req, res) {
    try {
      const { chatId } = req.params;
      
      // Check if chat exists
      const chat = await chatModel.findById(chatId);
      
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
      
      // Check if user is a participant
      const isParticipant = await chatModel.isParticipant(chatId, req.user.userId);
      if (!isParticipant) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
      }
      
      // Delete chat
      await chatModel.delete(chatId);
      
      res.json({ message: 'Chat deleted successfully', chatId });
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = chatController;
