
const db = require('../config/database');

const messageModel = {
  // Create a new message
  async create(messageData) {
    const { chatId, senderId, text, fileId } = messageData;
    
    const result = await db.query(
      'INSERT INTO messages (chat_id, sender_id, text, file_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [chatId, senderId, text, fileId || null]
    );
    
    return result.rows[0];
  },
  
  // Get messages for a chat
  async findByChatId(chatId) {
    const result = await db.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
      [chatId]
    );
    
    return result.rows;
  },
  
  // Get a single message by ID
  async findById(messageId) {
    const result = await db.query('SELECT * FROM messages WHERE id = $1', [messageId]);
    return result.rows[0];
  },
  
  // Update a message
  async update(messageId, text) {
    const result = await db.query(
      'UPDATE messages SET text = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [text, messageId]
    );
    
    return result.rows[0];
  },
  
  // Delete a message
  async delete(messageId) {
    await db.query('DELETE FROM messages WHERE id = $1', [messageId]);
  },
  
  // Get last message for a chat
  async getLastMessage(chatId) {
    const result = await db.query(
      'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 1',
      [chatId]
    );
    
    return result.rows[0] || null;
  },
  
  // Mark messages as read
  async markAsRead(chatId, userId) {
    await db.query(
      `UPDATE messages 
       SET read = true 
       WHERE chat_id = $1 AND sender_id != $2 AND NOT read`,
      [chatId, userId]
    );
  }
};

module.exports = messageModel;
