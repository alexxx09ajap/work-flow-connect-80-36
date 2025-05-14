
const db = require('../config/database');

const fileModel = {
  // Save a new file
  async create(fileData) {
    const { filename, contentType, size, data, uploadedBy } = fileData;
    
    const result = await db.query(
      'INSERT INTO files (filename, content_type, size, data, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING id, filename, content_type, size, uploaded_by',
      [filename, contentType, size, data, uploadedBy]
    );
    
    return result.rows[0];
  },
  
  // Get a file by ID
  async findById(fileId) {
    const result = await db.query('SELECT * FROM files WHERE id = $1', [fileId]);
    return result.rows[0];
  },
  
  // Delete a file
  async delete(fileId) {
    await db.query('DELETE FROM files WHERE id = $1', [fileId]);
  },
  
  // Check if user is the owner of the file
  async isOwner(fileId, userId) {
    const result = await db.query('SELECT uploaded_by FROM files WHERE id = $1', [fileId]);
    return result.rows[0] && result.rows[0].uploaded_by === userId;
  }
};

module.exports = fileModel;
