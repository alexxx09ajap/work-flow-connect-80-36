
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
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'models', 'db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    await pool.query(sql);
    console.log('Database tables created successfully');

    // Close the connection
    await pool.end();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the function
initDb();
