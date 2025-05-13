
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const jobModel = {
  // Create a new job
  async create(jobData) {
    const { title, description, budget, category, skills, userId } = jobData;
    const id = uuidv4();
    const status = 'open';
    const now = new Date();
    
    const result = await db.query(
      `INSERT INTO "Jobs" (id, title, description, budget, category, skills, status, "userId", "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, title, description, budget, category, skills, status, "userId", "createdAt", "updatedAt"`,
      [id, title, description, budget, category, skills, status, userId, now, now]
    );
    
    console.log('Job created with dates:', { createdAt: now, updatedAt: now });
    return result.rows[0];
  },
  
  // Get all jobs with optional filtering
  async findAll(filter = {}) {
    let query = `
      SELECT j.id, j.title, j.description, j.budget, j.category, j.skills, j.status, 
             j."userId", j."createdAt", j."updatedAt"
      FROM "Jobs" j
    `;
    
    const params = [];
    const conditions = [];
    
    if (filter.category) {
      params.push(filter.category);
      conditions.push(`j.category = $${params.length}`);
    }
    
    if (filter.status) {
      params.push(filter.status);
      conditions.push(`j.status = $${params.length}`);
    }
    
    if (filter.search) {
      params.push(`%${filter.search}%`);
      conditions.push(`(j.title ILIKE $${params.length} OR j.description ILIKE $${params.length})`);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY j."createdAt" DESC`;
    
    const result = await db.query(query, params);
    return result.rows;
  },
  
  // Find job by ID
  async findById(jobId) {
    const result = await db.query(
      `SELECT j.id, j.title, j.description, j.budget, j.category, j.skills, j.status, 
              j."userId", j."createdAt", j."updatedAt"
       FROM "Jobs" j
       WHERE j.id = $1`,
      [jobId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  },
  
  // Update a job
  async update(jobId, jobData) {
    const { title, description, budget, category, skills, status } = jobData;
    
    // Build the SET part of the query dynamically based on the provided fields
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      updates.push(`title = $${updates.length + 1}`);
      values.push(title);
    }
    
    if (description !== undefined) {
      updates.push(`description = $${updates.length + 1}`);
      values.push(description);
    }
    
    if (budget !== undefined) {
      updates.push(`budget = $${updates.length + 1}`);
      values.push(budget);
    }
    
    if (category !== undefined) {
      updates.push(`category = $${updates.length + 1}`);
      values.push(category);
    }
    
    if (skills !== undefined) {
      updates.push(`skills = $${updates.length + 1}`);
      values.push(skills);
    }
    
    if (status !== undefined) {
      updates.push(`status = $${updates.length + 1}`);
      values.push(status);
    }
    
    // Add updated_at with current timestamp
    updates.push(`"updatedAt" = $${updates.length + 1}`);
    values.push(new Date());
    
    // Add jobId to values array
    values.push(jobId);
    
    const query = `
      UPDATE "Jobs" 
      SET ${updates.join(', ')} 
      WHERE id = $${values.length} 
      RETURNING id, title, description, budget, category, skills, status, "userId", "createdAt", "updatedAt"
    `;
    
    const result = await db.query(query, values);
    
    return result.rows[0];
  },
  
  // Delete a job
  async delete(jobId) {
    await db.query('DELETE FROM "Jobs" WHERE id = $1', [jobId]);
    return true;
  }
};

module.exports = jobModel;
