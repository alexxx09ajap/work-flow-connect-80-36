
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
      // Verificar si existen las columnas necesarias
      const columnInfo = await this.checkColumns();
      
      let result;
      // Construir la consulta basada en las columnas disponibles
      let query = 'INSERT INTO "Messages" (id, "chatId", "userId", content, read, "createdAt", "updatedAt"';
      let valueParams = '$1, $2, $3, $4, $5, $6, $7';
      let values = [messageId, chatId, senderId, text, false, now, now];
      let valueIndex = 8;
      
      if (columnInfo.hasDeleted) {
        query += ', "deleted"';
        valueParams += `, $${valueIndex}`;
        values.push(false);
        valueIndex++;
      }
      
      if (columnInfo.hasEdited) {
        query += ', "edited"';
        valueParams += `, $${valueIndex}`;
        values.push(false);
        valueIndex++;
      }
      
      if (columnInfo.hasFileId) {
        if (fileId) {
          query += ', "fileId"';
          valueParams += `, $${valueIndex}`;
          values.push(fileId);
          valueIndex++;
        }
      } else if (fileId) {
        // Si tenemos fileId pero la columna no existe, intentamos agregarla primero
        await this.addFileIdColumn();
        // Añadir fileId a la consulta
        query += ', "fileId"';
        valueParams += `, $${valueIndex}`;
        values.push(fileId);
        valueIndex++;
      }
      
      query += `) VALUES (${valueParams}) RETURNING *`;
      
      result = await db.query(query, values);
      
      // Añadir el senderId explícitamente para garantizar la coherencia
      const message = {
        ...result.rows[0],
        senderId: senderId,
        deleted: result.rows[0].deleted || false,
        edited: result.rows[0].edited || false
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
        // Verificar si existe la propiedad deleted y edited, si no existe asumimos false
        const deleted = typeof row.deleted !== 'undefined' ? row.deleted : false;
        const edited = typeof row.edited !== 'undefined' ? row.edited : false;
        
        return {
          ...row,
          senderId: row.userId || row.senderId,
          timestamp: row.createdAt, // Añadimos timestamp para compatibilidad con el frontend
          deleted: deleted,
          edited: edited
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
          deleted: result.rows[0].deleted || false,
          edited: result.rows[0].edited || false
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
      const columnInfo = await this.checkColumns();
      
      let query;
      let values;
      
      if (columnInfo.hasEdited) {
        query = 'UPDATE "Messages" SET content = $1, "updatedAt" = $2, "edited" = true WHERE id = $3 RETURNING *, "userId" as "senderId"';
        values = [text, now, messageId];
      } else {
        // Si no existe la columna edited, primero intentamos agregarla
        await this.addEditedColumn();
        
        // Luego hacemos la actualización sin usar la columna edited para evitar errores
        query = 'UPDATE "Messages" SET content = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *, "userId" as "senderId"';
        values = [text, now, messageId];
      }
      
      const result = await db.query(query, values);
      
      // Aseguramos que siempre devolvemos edited como true para mensajes actualizados
      return result.rows[0] ? {
        ...result.rows[0],
        edited: true,
        deleted: result.rows[0].deleted || false
      } : null;
    } catch (error) {
      console.error("Error al actualizar mensaje:", error);
      // Si hay un error con la columna edited, intentamos con la consulta alternativa
      try {
        const query = 'UPDATE "Messages" SET content = $1, "updatedAt" = $2 WHERE id = $3 RETURNING *, "userId" as "senderId"';
        const values = [text, now, messageId];
        
        const result = await db.query(query, values);
        
        return result.rows[0] ? {
          ...result.rows[0],
          edited: true,
          deleted: result.rows[0].deleted || false
        } : null;
      } catch (secondError) {
        console.error("Error en el segundo intento de actualizar mensaje:", secondError);
        throw secondError;
      }
    }
  },
  
  // Delete a message (marcar como eliminado)
  async delete(messageId) {
    const now = new Date();
    
    try {
      const columnInfo = await this.checkColumns();
      
      let query;
      let values;
      
      if (columnInfo.hasDeleted) {
        query = 'UPDATE "Messages" SET deleted = true, content = \'[Mensaje eliminado]\', "updatedAt" = $1 WHERE id = $2 RETURNING *, "userId" as "senderId"';
        values = [now, messageId];
      } else {
        query = 'UPDATE "Messages" SET content = \'[Mensaje eliminado]\', "updatedAt" = $1 WHERE id = $2 RETURNING *, "userId" as "senderId"';
        values = [now, messageId];
        
        // Intentar agregar la columna deleted si no existe
        await this.addDeletedColumn();
      }
      
      const result = await db.query(query, values);
      
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
      deleted: result.rows[0].deleted || false,
      edited: result.rows[0].edited || false
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
  
  // Find a message by file ID
  async findByFileId(fileId) {
    try {
      const result = await db.query(
        'SELECT *, "userId" as "senderId" FROM "Messages" WHERE "fileId" = $1', 
        [fileId]
      );
      
      if (result.rows[0]) {
        return {
          ...result.rows[0],
          deleted: result.rows[0].deleted || false,
          edited: result.rows[0].edited || false
        };
      }
      return null;
    } catch (error) {
      console.error("Error finding message by file ID:", error);
      return null;
    }
  },
  
  // Check if columns exist
  async checkColumns() {
    try {
      const result = await db.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'Messages';
      `);
      
      const columns = result.rows.map(row => row.column_name);
      
      return {
        hasDeleted: columns.includes('deleted'),
        hasEdited: columns.includes('edited'),
        hasFileId: columns.includes('fileId')
      };
    } catch (error) {
      console.error("Error verificando columnas:", error);
      return {
        hasDeleted: false,
        hasEdited: false,
        hasFileId: false
      };
    }
  },
  
  // Add deleted column if it doesn't exist
  async addDeletedColumn() {
    try {
      const columnInfo = await this.checkColumns();
      
      if (!columnInfo.hasDeleted) {
        console.log("Agregando columna 'deleted' a la tabla Messages...");
        await db.query(`
          ALTER TABLE "Messages"
          ADD COLUMN "deleted" BOOLEAN DEFAULT false;
        `);
        console.log("Columna 'deleted' agregada con éxito");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error al agregar columna deleted:", error);
      return false;
    }
  },
  
  // Add edited column if it doesn't exist
  async addEditedColumn() {
    try {
      const columnInfo = await this.checkColumns();
      
      if (!columnInfo.hasEdited) {
        console.log("Agregando columna 'edited' a la tabla Messages...");
        await db.query(`
          ALTER TABLE "Messages"
          ADD COLUMN "edited" BOOLEAN DEFAULT false;
        `);
        console.log("Columna 'edited' agregada con éxito");
        return true;
      }
      
      return false;
    } catch (error) {
      // Si el error es porque la columna ya existe, ignoramos el error
      if (error.code !== '42701') { // 42701 es el código para columna ya existente
        console.error("Error al agregar columna edited:", error);
      }
      return false;
    }
  },
  
  // Add fileId column if it doesn't exist
  async addFileIdColumn() {
    try {
      const columnInfo = await this.checkColumns();
      
      if (!columnInfo.hasFileId) {
        console.log("Agregando columna 'fileId' a la tabla Messages...");
        await db.query(`
          ALTER TABLE "Messages"
          ADD COLUMN "fileId" INTEGER REFERENCES "Files"(id) ON DELETE SET NULL;
        `);
        console.log("Columna 'fileId' agregada con éxito");
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error al agregar columna fileId:", error);
      return false;
    }
  }
};

module.exports = messageModel;
