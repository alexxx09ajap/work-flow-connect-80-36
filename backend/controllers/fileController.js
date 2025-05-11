
const fileModel = require('../models/fileModel');
const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');

const fileController = {
  // Upload a file and create a message
  async uploadFile(req, res) {
    try {
      const { filename, contentType, data, size, chatId } = req.body;
      
      // Check if user is a participant
      const isParticipant = await chatModel.isParticipant(chatId, req.user.userId);
      if (!isParticipant) {
        return res.status(403).json({ message: 'You are not a participant in this chat' });
      }
      
      // Convert base64 data to Buffer
      const fileBuffer = Buffer.from(data, 'base64');
      
      // Create file
      const file = await fileModel.create({
        filename,
        contentType,
        size,
        data: fileBuffer,
        uploadedBy: req.user.userId
      });
      
      // Create message with file reference
      const message = await messageModel.create({
        chatId,
        senderId: req.user.userId,
        text: `File: ${filename}`,
        fileId: file.id
      });
      
      // Update last message in chat
      await chatModel.updateLastMessage(chatId, message.id);
      
      // Return message with file data (without the binary data)
      const messageWithFile = {
        ...message,
        file: {
          id: file.id,
          filename: file.filename,
          contentType: file.content_type,
          size: file.size
        }
      };
      
      res.status(201).json(messageWithFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Get a file
  async getFile(req, res) {
    try {
      const { fileId } = req.params;
      
      // Get file
      const file = await fileModel.findById(fileId);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Find message that contains this file
      const message = await messageModel.findById(fileId);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found for this file' });
      }
      
      // Check if user has access to the chat
      const isParticipant = await chatModel.isParticipant(message.chat_id, req.user.userId);
      if (!isParticipant) {
        return res.status(403).json({ message: 'You do not have access to this file' });
      }
      
      // Set headers for download
      res.set({
        'Content-Type': file.content_type,
        'Content-Disposition': `attachment; filename="${file.filename}"`
      });
      
      // Send file
      res.send(file.data);
    } catch (error) {
      console.error('Error getting file:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = fileController;
