
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const userModel = {
  // Create a new user
  async create(userData) {
    const { username, email, password, avatar } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Usado name en lugar de username para ser consistente con la estructura de la BD
    // Usado photoURL en lugar de avatar y isOnline en lugar de status
    const result = await db.query(
      'INSERT INTO "Users" (name, email, password, "photoURL", "isOnline", role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, "photoURL", role, "createdAt"',
      [username, email, hashedPassword, avatar || null, true, 'client']
    );
    
    return result.rows[0];
  },
  
  // Find user by email
  async findByEmail(email) {
    const result = await db.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    return result.rows[0];
  },
  
  // Find user by ID
  async findById(id) {
    const result = await db.query(
      'SELECT id, name, email, "photoURL" as avatar, "isOnline" as status, "lastSeen", "createdAt" FROM "Users" WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },
  
  // Get all users except the one with the given ID
  async findAllExcept(userId) {
    const result = await db.query(
      'SELECT id, name, email, "photoURL" as avatar, "isOnline" as status, "lastSeen", "createdAt" FROM "Users" WHERE id != $1',
      [userId]
    );
    return result.rows;
  },
  
  // Update user status
  async updateStatus(userId, status) {
    const isOnline = status === 'online';
    const result = await db.query(
      'UPDATE "Users" SET "isOnline" = $1, "lastSeen" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, "isOnline"',
      [isOnline, userId]
    );
    return result.rows[0];
  },
  
  // Update user profile
  async updateProfile(userId, userData) {
    const { username, avatar } = userData;
    
    const result = await db.query(
      'UPDATE "Users" SET name = COALESCE($1, name), "photoURL" = COALESCE($2, "photoURL"), "updatedAt" = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, "photoURL" as avatar, "isOnline" as status',
      [username, avatar, userId]
    );
    
    return result.rows[0];
  }
};

module.exports = userModel;
