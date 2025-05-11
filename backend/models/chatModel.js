
const db = require('../config/database');

const chatModel = {
  // Get all chats for a user
  async findByUserId(userId) {
    try {
      const result = await db.query(`
        SELECT c.* FROM "Chats" c
        JOIN "ChatParticipants" cp ON c.id = cp."chatId"
        WHERE cp."userId" = $1
        ORDER BY c."updatedAt" DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      return [];
    }
  },
  
  // Get a chat by ID
  async findById(chatId) {
    try {
      const result = await db.query('SELECT * FROM "Chats" WHERE id = $1', [chatId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  },
  
  // Check if a user is participant in a chat
  async isParticipant(chatId, userId) {
    try {
      const result = await db.query(
        'SELECT 1 FROM "ChatParticipants" WHERE "chatId" = $1 AND "userId" = $2',
        [chatId, userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in isParticipant:', error);
      return false;
    }
  },
  
  // Create a new private chat
  async createPrivateChat(participants) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if private chat already exists between these users
      if (participants.length === 2) {
        const existingChat = await client.query(`
          SELECT c.id FROM "Chats" c
          JOIN "ChatParticipants" cp1 ON c.id = cp1."chatId" AND cp1."userId" = $1
          JOIN "ChatParticipants" cp2 ON c.id = cp2."chatId" AND cp2."userId" = $2
          WHERE NOT c."isGroup"
          AND (
            SELECT COUNT(*) FROM "ChatParticipants" WHERE "chatId" = c.id
          ) = 2
        `, [participants[0], participants[1]]);
        
        if (existingChat.rows.length > 0) {
          await client.query('COMMIT');
          return existingChat.rows[0].id;
        }
      }
      
      // Create new chat - Explicitly generate UUID for id
      const chatId = await db.query('SELECT gen_random_uuid() as id').then(res => res.rows[0].id);
      
      const chatResult = await client.query(
        'INSERT INTO "Chats" (id, "isGroup", "createdAt", "updatedAt") VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
        [chatId, false]
      );
      
      // Add participants
      for (const userId of participants) {
        await client.query(
          'INSERT INTO "ChatParticipants" (id, "chatId", "userId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [chatId, userId]
        );
      }
      
      await client.query('COMMIT');
      return chatId;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in createPrivateChat:', err);
      throw err;
    } finally {
      client.release();
    }
  },
  
  // Create a group chat
  async createGroupChat(name, participants, adminId) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Generate UUID explicitly
      const chatId = await db.query('SELECT gen_random_uuid() as id').then(res => res.rows[0].id);
      
      // Create new chat with the generated UUID
      const chatResult = await client.query(
        'INSERT INTO "Chats" (id, name, "isGroup", "createdAt", "updatedAt") VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id',
        [chatId, name, true]
      );
      
      // Add participants
      for (const userId of participants) {
        await client.query(
          'INSERT INTO "ChatParticipants" (id, "chatId", "userId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [chatId, userId]
        );
      }
      
      await client.query('COMMIT');
      return chatId;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error in createGroupChat:', err);
      throw err;
    } finally {
      client.release();
    }
  },
  
  // Add participant to chat
  async addParticipant(chatId, userId) {
    try {
      await db.query(
        'INSERT INTO "ChatParticipants" (id, "chatId", "userId", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT DO NOTHING',
        [chatId, userId]
      );
    } catch (error) {
      console.error('Error in addParticipant:', error);
    }
  },
  
  // Remove participant from chat
  async removeParticipant(chatId, userId) {
    try {
      await db.query(
        'DELETE FROM "ChatParticipants" WHERE "chatId" = $1 AND "userId" = $2',
        [chatId, userId]
      );
    } catch (error) {
      console.error('Error in removeParticipant:', error);
    }
  },
  
  // Get all participants of a chat
  async getParticipants(chatId) {
    try {
      const result = await db.query(`
        SELECT u.id, u.name, u.email, u."photoURL", u."isOnline"
        FROM "Users" u
        JOIN "ChatParticipants" cp ON u.id = cp."userId"
        WHERE cp."chatId" = $1
      `, [chatId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error in getParticipants:', error);
      return [];
    }
  },
  
  // Update last message of a chat
  async updateLastMessage(chatId) {
    try {
      await db.query(
        'UPDATE "Chats" SET "lastMessageAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1',
        [chatId]
      );
    } catch (error) {
      console.error('Error in updateLastMessage:', error);
    }
  },
  
  // Delete a chat
  async delete(chatId) {
    try {
      await db.query('DELETE FROM "Chats" WHERE id = $1', [chatId]);
    } catch (error) {
      console.error('Error in delete:', error);
    }
  }
};

module.exports = chatModel;
