
const db = require('../config/database');

const fileModel = {
  // Save a new file
  async create(fileData) {
    const { filename, contentType, size, data, uploadedBy } = fileData;
    
    try {
      const result = await db.query(
        'INSERT INTO "Files" (filename, content_type, size, data, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING id, filename, content_type, size, uploaded_by',
        [filename, contentType, size, data, uploadedBy]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error creating file record:', error);
      throw error;
    }
  },
  
  // Get a file by ID
  async findById(fileId) {
    try {
      const result = await db.query('SELECT * FROM "Files" WHERE id = $1', [fileId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding file:', error);
      throw error;
    }
  },
  
  // Delete a file
  async delete(fileId) {
    try {
      await db.query('DELETE FROM "Files" WHERE id = $1', [fileId]);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
  
  // Check if user is the owner of the file
  async isOwner(fileId, userId) {
    try {
      const result = await db.query('SELECT uploaded_by FROM "Files" WHERE id = $1', [fileId]);
      return result.rows[0] && result.rows[0].uploaded_by === userId;
    } catch (error) {
      console.error('Error checking file ownership:', error);
      throw error;
    }
  },
  
  // Check if Files table exists, if not create it
  async ensureFilesTableExists() {
    try {
      // Check if table exists
      const tableExists = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'Files'
        );
      `);
      
      // If table doesn't exist, create it
      if (!tableExists.rows[0].exists) {
        await db.query(`
          CREATE TABLE IF NOT EXISTS "Files" (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            content_type VARCHAR(100) NOT NULL,
            size INTEGER NOT NULL,
            data BYTEA NOT NULL,
            uploaded_by UUID REFERENCES "Users"(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Create view for lowercase 'files' to ensure compatibility
          CREATE OR REPLACE VIEW files AS SELECT * FROM "Files";
        `);
        
        return true; // Table was created
      }
      
      return false; // Table already existed
    } catch (error) {
      console.error('Error ensuring Files table exists:', error);
      throw error;
    }
  }
};

module.exports = fileModel;
