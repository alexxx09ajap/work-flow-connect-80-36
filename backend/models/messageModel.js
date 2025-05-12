
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const messageModel = {
  // Create a new message
  async create(messageData) {
    const { chatId, senderId, text, fileId } = messageData;
    
    // Generate UUID for the message
    const messageId = uuidv4();
    
    const result = await db.query(
      'INSERT INTO "Messages" (id, "chatId", "userId", content, read) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [messageId, chatId, senderId, text, false]
    );
    
    return result.rows[0];
  },
  
  // Get messages for a chat
  async findByChatId(chatId) {
    const result = await db.query(
      'SELECT * FROM "Messages" WHERE "chatId" = $1 ORDER BY "createdAt" ASC',
      [chatId]
    );
    
    return result.rows;
  },
  
  // Get a single message by ID
  async findById(messageId) {
    const result = await db.query('SELECT * FROM "Messages" WHERE id = $1', [messageId]);
    return result.rows[0];
  },
  
  // Update a message
  async update(messageId, text) {
    const result = await db.query(
      'UPDATE "Messages" SET content = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [text, messageId]
    );
    
    return result.rows[0];
  },
  
  // Delete a message
  async delete(messageId) {
    await db.query('DELETE FROM "Messages" WHERE id = $1', [messageId]);
  },
  
  // Get last message for a chat
  async getLastMessage(chatId) {
    const result = await db.query(
      'SELECT * FROM "Messages" WHERE "chatId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
      [chatId]
    );
    
    return result.rows[0] || null;
  },
  
  // Mark messages as read
  async markAsRead(chatId, userId) {
    await db.query(
      `UPDATE "Messages" 
       SET read = true 
       WHERE "chatId" = $1 AND "userId" != $2 AND NOT read`,
      [chatId, userId]
    );
  }
};

module.exports = messageModel;
