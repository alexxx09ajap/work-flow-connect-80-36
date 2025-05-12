
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
      // Intentar verificar si existe la columna "deleted"
      const columnExists = await this.checkDeletedColumn();
      
      let result;
      if (columnExists) {
        // Si existe la columna, incluirla en el INSERT
        result = await db.query(
          'INSERT INTO "Messages" (id, "chatId", "userId", content, read, "createdAt", "updatedAt", "deleted") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
          [messageId, chatId, senderId, text, false, now, now, false]
        );
      } else {
        // Si no existe la columna, omitirla
        result = await db.query(
          'INSERT INTO "Messages" (id, "chatId", "userId", content, read, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [messageId, chatId, senderId, text, false, now, now]
        );
      }
      
      // Añadir el senderId explícitamente para garantizar la coherencia
      const message = {
        ...result.rows[0],
        senderId: senderId,
        deleted: false
      };
      
      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
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
      return result.rows.map(row => {
        // Verificar si existe la propiedad deleted, si no existe asumimos false
        const deleted = typeof row.deleted !== 'undefined' ? row.deleted : false;
        
        return {
          ...row,
          senderId: row.userId || row.senderId,
          timestamp: row.createdAt, // Añadimos timestamp para compatibilidad con el frontend
          deleted: deleted
        };
      });
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
    try {
      const result = await db.query(
        'UPDATE "Messages" SET content = $1, "updatedAt" = $2, "edited" = true WHERE id = $3 RETURNING *, "userId" as "senderId"',
        [text, now, messageId]
      );
      
      return result.rows[0] ? {
        ...result.rows[0],
        edited: true,
        deleted: result.rows[0].deleted || false
      } : null;
    } catch (error) {
      // Si falla porque no existe la columna "edited", simplemente actualizamos sin ella
      if (error.code === '42703' && error.message.includes('edited')) {
        const result = await db.query(
          'UPDATE "Messages" SET content = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *, "userId" as "senderId"',
          [text, now, messageId]
        );
        
        if (result.rows[0]) {
          return {
            ...result.rows[0],
            edited: true,
            deleted: result.rows[0].deleted || false
          };
        }
      }
      
      console.error("Error al actualizar mensaje:", error);
      throw error;
    }
  },
  
  // Delete a message (marcar como eliminado)
  async delete(messageId) {
    const now = new Date();
    
    try {
      // Intentar verificar si existe la columna "deleted"
      const columnExists = await this.checkDeletedColumn();
      
      let result;
      if (columnExists) {
        // Si existe la columna, marcarla como true
        result = await db.query(
          'UPDATE "Messages" SET deleted = true, content = \'[Mensaje eliminado]\', "updatedAt" = $1 WHERE id = $2 RETURNING *, "userId" as "senderId"',
          [now, messageId]
        );
      } else {
        // Si no existe la columna, solo actualizar el contenido
        result = await db.query(
          'UPDATE "Messages" SET content = \'[Mensaje eliminado]\', "updatedAt" = $1 WHERE id = $2 RETURNING *, "userId" as "senderId"',
          [now, messageId]
        );
      }
      
      if (result.rows[0]) {
        return {
          ...result.rows[0],
          deleted: true,
          content: '[Mensaje eliminado]'
        };
      }
      return null;
    } catch (error) {
      console.error("Error al eliminar mensaje:", error);
      throw error;
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
        
        // También agregar columna "edited" si es necesario
        try {
          await db.query(`
            ALTER TABLE "Messages"
            ADD COLUMN "edited" BOOLEAN DEFAULT false;
          `);
          console.log("Columna 'edited' agregada con éxito");
        } catch (editedError) {
          // Si ya existe, ignorar el error
          if (editedError.code !== '42701') { // 42701 es el código para columna ya existente
            console.error("Error al agregar columna 'edited':", editedError);
          }
        }
        
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
