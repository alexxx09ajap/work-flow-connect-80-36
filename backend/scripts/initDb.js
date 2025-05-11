
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
      WHERE table_schema='public' AND table_name IN ('Chats', 'ChatParticipants', 'Messages');
    `;
    
    const existingTables = await pool.query(checkTablesQuery);
    const tableNames = existingTables.rows.map(row => row.table_name);
    
    // Log detected tables
    console.log('Detected tables:', tableNames);
    
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
