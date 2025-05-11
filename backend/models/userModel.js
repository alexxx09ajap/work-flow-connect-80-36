
const db = require('../config/database');
const bcrypt = require('bcryptjs');

const userModel = {
  // Create a new user
  async create(userData) {
    const { username, email, password, avatar } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await db.query(
      'INSERT INTO users (username, email, password, avatar, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, avatar, status, created_at',
      [username, email, hashedPassword, avatar || null, 'online']
    );
    
    return result.rows[0];
  },
  
  // Find user by email
  async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  
  // Find user by ID
  async findById(id) {
    const result = await db.query(
      'SELECT id, username, email, avatar, status, last_seen, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },
  
  // Get all users except the one with the given ID
  async findAllExcept(userId) {
    const result = await db.query(
      'SELECT id, username, email, avatar, status, last_seen, created_at FROM users WHERE id != $1',
      [userId]
    );
    return result.rows;
  },
  
  // Update user status
  async updateStatus(userId, status) {
    const result = await db.query(
      'UPDATE users SET status = $1, last_seen = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, status',
      [status, userId]
    );
    return result.rows[0];
  },
  
  // Update user profile
  async updateProfile(userId, userData) {
    const { username, avatar } = userData;
    
    const result = await db.query(
      'UPDATE users SET username = COALESCE($1, username), avatar = COALESCE($2, avatar), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, username, email, avatar, status',
      [username, avatar, userId]
    );
    
    return result.rows[0];
  }
};

module.exports = userModel;
