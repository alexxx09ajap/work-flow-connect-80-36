
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
    
    try {
      // Intentar insertar con la columna "deleted"
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
    } catch (error) {
      // Si falla porque no existe la columna "deleted", intentar sin ella
      if (error.code === '42703' && error.message.includes('deleted')) {
        const result = await db.query(
          'INSERT INTO "Messages" (id, "chatId", "userId", content, read, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [messageId, chatId, senderId, text, false, now, now]
        );
        
        // Añadir el senderId y deleted explícitamente para garantizar la coherencia
        const message = {
          ...result.rows[0],
          senderId: senderId,
          deleted: false
        };
        
        return message;
      } else {
        throw error; // Si es otro tipo de error, relanzarlo
      }
    }
  },
  
  // Get messages for a chat
  async findByChatId(chatId) {
    try {
      const result = await db.query(
        'SELECT m.*, m."userId" as "senderId", u.name as "senderName", u."photoURL" as "senderPhoto" FROM "Messages" m LEFT JOIN "Users" u ON m."userId" = u.id WHERE m."chatId" = $1 ORDER BY m."createdAt" ASC',
        [chatId]
      );
      
      // Nos aseguramos de que cada mensaje tenga un senderId explícito para la coherencia en la interfaz
      return result.rows.map(row => ({
        ...row,
        senderId: row.userId || row.senderId,
        timestamp: row.createdAt, // Añadimos timestamp para compatibilidad con el frontend
        deleted: row.deleted || false // Si no existe la columna deleted, asumimos false
      }));
    } catch (error) {
      console.error("Error al obtener mensajes:", error);
      return [];
    }
  },
  
  // Get a single message by ID
  async findById(messageId) {
    try {
      const result = await db.query(
        'SELECT *, "userId" as "senderId" FROM "Messages" WHERE id = $1', 
        [messageId]
      );
      
      if (result.rows[0]) {
        return {
          ...result.rows[0],
          deleted: result.rows[0].deleted || false // Si no existe la columna deleted, asumimos false
        };
      }
      return null;
    } catch (error) {
      console.error("Error al buscar mensaje:", error);
      return null;
    }
  },
  
  // Update a message
  async update(messageId, text) {
    const now = new Date();
    const result = await db.query(
      'UPDATE "Messages" SET content = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *, "userId" as "senderId"',
      [text, now, messageId]
    );
    
    return result.rows[0] ? {
      ...result.rows[0],
      deleted: result.rows[0].deleted || false
    } : null;
  },
  
  // Delete a message (marcar como eliminado)
  async delete(messageId) {
    const now = new Date();
    
    try {
      // Intentar actualizar con la columna "deleted"
      const result = await db.query(
        'UPDATE "Messages" SET deleted = true, content = \'[Mensaje eliminado]\', "updatedAt" = $1 WHERE id = $2 RETURNING *, "userId" as "senderId"',
        [now, messageId]
      );
      
      if (result.rows[0]) {
        return {
          ...result.rows[0],
          deleted: true
        };
      }
      return null;
    } catch (error) {
      // Si falla porque no existe la columna "deleted", simplemente actualizamos el contenido
      if (error.code === '42703' && error.message.includes('deleted')) {
        const result = await db.query(
          'UPDATE "Messages" SET content = \'[Mensaje eliminado]\', "updatedAt" = $1 WHERE id = $2 RETURNING *, "userId" as "senderId"',
          [now, messageId]
        );
        
        if (result.rows[0]) {
          return {
            ...result.rows[0],
            deleted: true // Lo marcamos manualmente como deleted aunque no exista la columna
          };
        }
        return null;
      } else {
        throw error; // Si es otro tipo de error, relanzarlo
      }
    }
  },
  
  // Get last message for a chat
  async getLastMessage(chatId) {
    const result = await db.query(
      'SELECT *, "userId" as "senderId" FROM "Messages" WHERE "chatId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
      [chatId]
    );
    
    return result.rows[0] ? {
      ...result.rows[0],
      deleted: result.rows[0].deleted || false
    } : null;
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
  },
  
  // Check if the deleted column exists
  async checkDeletedColumn() {
    try {
      const result = await db.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'Messages'
        AND column_name = 'deleted';
      `);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error verificando columna deleted:", error);
      return false;
    }
  },
  
  // Add deleted column if it doesn't exist
  async addDeletedColumn() {
    try {
      const columnExists = await this.checkDeletedColumn();
      
      if (!columnExists) {
        console.log("Agregando columna 'deleted' a la tabla Messages...");
        await db.query(`
          ALTER TABLE "Messages"
          ADD COLUMN "deleted" BOOLEAN DEFAULT false;
        `);
        console.log("Columna 'deleted' agregada con éxito");
        return true;
      }
      
      console.log("La columna 'deleted' ya existe en la tabla Messages");
      return false;
    } catch (error) {
      console.error("Error al agregar columna deleted:", error);
      return false;
    }
  }
};

module.exports = messageModel;
