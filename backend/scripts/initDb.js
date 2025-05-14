
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'workflowconnect',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('Initializing database...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'models', 'db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    await pool.query(sql);
    console.log('Database tables created successfully');

    // Check if specific tables exist and create them if they don't
    const checkTablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND table_name IN ('Chats', 'ChatParticipants', 'Messages', 'Files', 'files');
    `;
    
    const existingTables = await pool.query(checkTablesQuery);
    const tableNames = existingTables.rows.map(row => row.table_name.toLowerCase());
    
    // Log detected tables
    console.log('Detected tables:', tableNames);
    
    // Check if tables are missing and create them if needed
    const missingTables = [];
    if (!tableNames.includes('chats')) {
      missingTables.push('Chats');
    }
    if (!tableNames.includes('chatparticipants')) {
      missingTables.push('ChatParticipants');
    }
    if (!tableNames.includes('messages')) {
      missingTables.push('Messages');
    }
    if (!tableNames.includes('files') && !tableNames.includes('Files')) {
      missingTables.push('Files');
    }
    
    if (missingTables.length > 0) {
      console.log(`Missing tables detected: ${missingTables.join(', ')}. Creating them...`);
      
      // Create missing tables
      const createTablesSQL = `
        -- Chats Table
        CREATE TABLE IF NOT EXISTS "Chats" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255),
          "isGroup" BOOLEAN DEFAULT FALSE,
          "lastMessageAt" TIMESTAMP,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Chat Participants Table (Many-to-Many)
        CREATE TABLE IF NOT EXISTS "ChatParticipants" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID REFERENCES "Users"(id) ON DELETE CASCADE,
          "chatId" UUID REFERENCES "Chats"(id) ON DELETE CASCADE,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE("userId", "chatId")
        );
        
        -- Messages Table
        CREATE TABLE IF NOT EXISTS "Messages" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "chatId" UUID REFERENCES "Chats"(id) ON DELETE SET NULL,
          "userId" UUID REFERENCES "Users"(id) ON DELETE SET NULL
        );
        
        -- Files Table
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
      `;
      
      await pool.query(createTablesSQL);
      console.log('Missing tables created successfully');
    } else {
      console.log('All required tables exist');
    }
    
    // Close the connection
    await pool.end();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the function
initDb();
