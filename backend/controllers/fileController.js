
const fileModel = require('../models/fileModel');
const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const fileController = {
  // Upload a file and create a message
  async uploadFile(req, res) {
    try {
      const { filename, contentType, data, size, chatId } = req.body;
      
      // Validate file size
      if (size > MAX_FILE_SIZE) {
        return res.status(400).json({ message: 'File size exceeds the maximum allowed (5MB)' });
      }
      
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
      
      // Get the socket service from the app to notify participants
      const socketService = req.app.get('socketService');
      if (socketService) {
        const participants = await chatModel.getParticipants(chatId);
        const participantIds = participants.map(p => p.id);
        
        // Notify all participants about the file message
        socketService.notifyUsers(participantIds, 'chat:message', chatId, messageWithFile);
      }
      
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
      const message = await messageModel.findByFileId(fileId);
      
      if (!message) {
        return res.status(404).json({ message: 'Message not found for this file' });
      }
      
      // Check if user has access to the chat
      const isParticipant = await chatModel.isParticipant(message.chatId, req.user.userId);
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
  },
  
  // Delete a file
  async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      
      // Get file
      const file = await fileModel.findById(fileId);
      
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Check if user is the owner of the file
      const isOwner = await fileModel.isOwner(fileId, req.user.userId);
      if (!isOwner) {
        return res.status(403).json({ message: 'You can only delete your own files' });
      }
      
      // Find message that contains this file
      const message = await messageModel.findByFileId(fileId);
      
      if (message) {
        // Mark message as deleted
        await messageModel.delete(message.id);
        
        // Update the chat's last message
        await chatModel.updateLastMessage(message.chatId);
        
        // Get the socket service to notify participants
        const socketService = req.app.get('socketService');
        if (socketService) {
          const participants = await chatModel.getParticipants(message.chatId);
          const participantIds = participants.map(p => p.id);
          
          // Notify all participants about the deleted message
          socketService.notifyUsers(participantIds, 'chat:message:delete', message.chatId, {
            id: message.id,
            chatId: message.chatId,
            deleted: true,
            content: '[Archivo eliminado]',
            timestamp: new Date().toISOString()
          });
        }
      }
      
      // Delete the file from storage
      await fileModel.delete(fileId);
      
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = fileController;
