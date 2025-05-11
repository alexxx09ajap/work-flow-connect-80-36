
const db = require('../config/database');

const chatModel = {
  // Get all chats for a user
  async findByUserId(userId) {
    const result = await db.query(`
      SELECT c.* FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC
    `, [userId]);
    
    return result.rows;
  },
  
  // Get a chat by ID
  async findById(chatId) {
    const result = await db.query('SELECT * FROM chats WHERE id = $1', [chatId]);
    return result.rows[0];
  },
  
  // Check if a user is participant in a chat
  async isParticipant(chatId, userId) {
    const result = await db.query(
      'SELECT 1 FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );
    return result.rows.length > 0;
  },
  
  // Create a new private chat
  async createPrivateChat(participants) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if private chat already exists between these users
      if (participants.length === 2) {
        const existingChat = await client.query(`
          SELECT c.id FROM chats c
          JOIN chat_participants cp1 ON c.id = cp1.chat_id AND cp1.user_id = $1
          JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.user_id = $2
          WHERE NOT c.is_group_chat
          AND (
            SELECT COUNT(*) FROM chat_participants WHERE chat_id = c.id
          ) = 2
        `, [participants[0], participants[1]]);
        
        if (existingChat.rows.length > 0) {
          await client.query('COMMIT');
          return existingChat.rows[0].id;
        }
      }
      
      // Create new chat
      const chatResult = await client.query(
        'INSERT INTO chats (is_group_chat) VALUES ($1) RETURNING id',
        [false]
      );
      
      const chatId = chatResult.rows[0].id;
      
      // Add participants
      for (const userId of participants) {
        await client.query(
          'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
          [chatId, userId]
        );
      }
      
      await client.query('COMMIT');
      return chatId;
    } catch (err) {
      await client.query('ROLLBACK');
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
      
      // Create new chat
      const chatResult = await client.query(
        'INSERT INTO chats (name, is_group_chat, admin_id) VALUES ($1, $2, $3) RETURNING id',
        [name, true, adminId]
      );
      
      const chatId = chatResult.rows[0].id;
      
      // Add participants
      for (const userId of participants) {
        await client.query(
          'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
          [chatId, userId]
        );
      }
      
      await client.query('COMMIT');
      return chatId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  
  // Add participant to chat
  async addParticipant(chatId, userId) {
    await db.query(
      'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [chatId, userId]
    );
  },
  
  // Remove participant from chat
  async removeParticipant(chatId, userId) {
    await db.query(
      'DELETE FROM chat_participants WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );
  },
  
  // Get all participants of a chat
  async getParticipants(chatId) {
    const result = await db.query(`
      SELECT u.id, u.username, u.email, u.avatar, u.status
      FROM users u
      JOIN chat_participants cp ON u.id = cp.user_id
      WHERE cp.chat_id = $1
    `, [chatId]);
    
    return result.rows;
  },
  
  // Update last message of a chat
  async updateLastMessage(chatId, messageId) {
    await db.query(
      'UPDATE chats SET last_message_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [messageId, chatId]
    );
  },
  
  // Delete a chat
  async delete(chatId) {
    await db.query('DELETE FROM chats WHERE id = $1', [chatId]);
  }
};

module.exports = chatModel;
