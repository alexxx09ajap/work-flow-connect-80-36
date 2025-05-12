
const userModel = require('../models/userModel');
const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const fileModel = require('../models/fileModel');

// Map to track connected users: userId -> socketId
const connectedUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', async (socket) => {
    const userId = socket.user.userId;
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
    
    // Update user status to online
    await userModel.updateStatus(userId, 'online');
    
    // Store the mapping: userId -> socketId
    connectedUsers.set(userId.toString(), socket.id);
    
    // Notify all users about status change
    io.emit('user:online', userId);
    
    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      
      // Update user status to offline
      await userModel.updateStatus(userId, 'offline');
      
      // Remove from connected users map
      connectedUsers.delete(userId.toString());
      
      // Notify all users about status change
      io.emit('user:offline', userId);
    });
    
    // Handle sending messages
    socket.on('sendMessage', async (messageData) => {
      try {
        const { chatId, text } = messageData;
        
        // Check if user is participant
        const isParticipant = await chatModel.isParticipant(chatId, userId);
        if (!isParticipant) {
          return socket.emit('error', 'You are not a participant in this chat');
        }
        
        console.log(`Socket sendMessage: userId=${userId}, chatId=${chatId}, text=${text}`);
        
        // Create message
        const message = await messageModel.create({
          chatId,
          senderId: userId,
          text
        });
        
        // Get sender information
        const result = await chatModel.getParticipants(chatId);
        const sender = result.find(user => user.id === userId);
        
        // Format message with sender info
        const formattedMessage = {
          ...message,
          senderId: userId, // Ensure senderId is explicitly set
          senderName: sender ? sender.name : 'Unknown User',
          senderPhoto: sender ? sender.photoURL : null,
          timestamp: message.createdAt
        };
        
        console.log('Socket formatted message:', formattedMessage);
        
        // Update last message in chat
        await chatModel.updateLastMessage(chatId);
        
        // Get participants of the chat
        const participants = await chatModel.getParticipants(chatId);
        
        // Send to all participants
        participants.forEach((participant) => {
          const socketId = connectedUsers.get(participant.id.toString());
          if (socketId) {
            io.to(socketId).emit('chat:message', chatId, formattedMessage);
          }
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Error sending message');
      }
    });
    
    // Handle file uploads
    socket.on('sendFile', async (fileData) => {
      try {
        const { chatId, filename, contentType, data, size } = fileData;
        
        // Check if user is participant
        const isParticipant = await chatModel.isParticipant(chatId, userId);
        if (!isParticipant) {
          return socket.emit('error', 'You are not a participant in this chat');
        }
        
        // Convert base64 to Buffer
        const fileBuffer = Buffer.from(data, 'base64');
        
        // Save file
        const file = await fileModel.create({
          filename,
          contentType,
          size,
          data: fileBuffer,
          uploadedBy: userId
        });
        
        // Create message with file reference
        const message = await messageModel.create({
          chatId,
          senderId: userId,
          text: `File: ${filename}`,
          fileId: file.id
        });
        
        // Update last message in chat
        await chatModel.updateLastMessage(chatId);
        
        // Message to send to clients (without binary data)
        const messageToSend = {
          ...message,
          senderId: userId, // Ensure senderId is explicitly set
          file: {
            id: file.id,
            filename,
            contentType,
            size
          }
        };
        
        // Get participants of the chat
        const participants = await chatModel.getParticipants(chatId);
        
        // Send to all participants
        participants.forEach((participant) => {
          const socketId = connectedUsers.get(participant.id.toString());
          if (socketId) {
            io.to(socketId).emit('chat:message', messageToSend);
          }
        });
      } catch (error) {
        console.error('Error sending file:', error);
        socket.emit('error', 'Error sending file');
      }
    });
  });
  
  return {
    connectedUsers,
    notifyUsers: (userIds, event, ...data) => {
      userIds.forEach((userId) => {
        const socketId = connectedUsers.get(userId.toString());
        if (socketId) {
          io.to(socketId).emit(event, ...data);
        }
      });
    }
  };
};

module.exports = socketHandler;
