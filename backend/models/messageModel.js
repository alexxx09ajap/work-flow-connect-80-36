
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const messageModel = {
  // Create a new message
  async create(messageData) {
    const { chatId, senderId, text, fileId } = messageData;
    
    // Generate UUID for the message
    const messageId = uuidv4();
    
    // Get current timestamp for createdAt and updatedAt
    const now = new Date();
    
    console.log(`Creating message: chatId=${chatId}, senderId=${senderId}, text=${text}`);
    
    // Asegurarse de que senderId se guarda tanto en userId (para compatibilidad) como en senderId
    const result = await db.query(
      'INSERT INTO "Messages" (id, "chatId", "userId", content, read, "createdAt", "updatedAt", "deleted") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [messageId, chatId, senderId, text, false, now, now, false]
    );
    
    // Añadir el senderId explícitamente para garantizar la coherencia
    const message = {
      ...result.rows[0],
      senderId: senderId
    };
    
    return message;
  },
  
  // Get messages for a chat
  async findByChatId(chatId) {
    const result = await db.query(
      'SELECT m.*, m."userId" as "senderId", u.name as "senderName", u."photoURL" as "senderPhoto" FROM "Messages" m LEFT JOIN "Users" u ON m."userId" = u.id WHERE m."chatId" = $1 ORDER BY m."createdAt" ASC',
      [chatId]
    );
    
    // Nos aseguramos de que cada mensaje tenga un senderId explícito para la coherencia en la interfaz
    return result.rows.map(row => ({
      ...row,
      senderId: row.userId || row.senderId,
      timestamp: row.createdAt // Añadimos timestamp para compatibilidad con el frontend
    }));
  },
  
  // Get a single message by ID
  async findById(messageId) {
    const result = await db.query(
      'SELECT *, "userId" as "senderId" FROM "Messages" WHERE id = $1', 
      [messageId]
    );
    return result.rows[0];
  },
  
  // Update a message
  async update(messageId, text) {
    const now = new Date();
    const result = await db.query(
      'UPDATE "Messages" SET content = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *, "userId" as "senderId"',
      [text, now, messageId]
    );
    
    return result.rows[0];
  },
  
  // Delete a message (marcar como eliminado)
  async delete(messageId) {
    const now = new Date();
    // En lugar de eliminar, marcamos como eliminado y mantenemos un placeholder
    const result = await db.query(
      'UPDATE "Messages" SET deleted = true, content = \'[Mensaje eliminado]\', "updatedAt" = $1 WHERE id = $2 RETURNING *, "userId" as "senderId"',
      [now, messageId]
    );
    
    return result.rows[0];
  },
  
  // Get last message for a chat
  async getLastMessage(chatId) {
    const result = await db.query(
      'SELECT *, "userId" as "senderId" FROM "Messages" WHERE "chatId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
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
    
    // Return the count of updated messages (optional)
    const result = await db.query(
      `SELECT COUNT(*) as updated_count 
       FROM "Messages" 
       WHERE "chatId" = $1 AND read = true AND "userId" != $2`,
      [chatId, userId]
    );
    
    return result.rows[0]?.updated_count || 0;
  }
};

module.exports = messageModel;
