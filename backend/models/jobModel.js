
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const jobModel = {
  // Create a new job
  async create(jobData) {
    const { title, description, budget, category, skills, userId } = jobData;
    const id = uuidv4();
    const status = 'open';
    
    const result = await db.query(
      `INSERT INTO jobs (id, title, description, budget, category, skills, status, user_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, title, description, budget, category, skills, status, user_id AS "userId", created_at, updated_at`,
      [id, title, description, budget, category, skills, status, userId]
    );
    
    // Convert snake_case to camelCase
    const job = result.rows[0];
    job.createdAt = job.created_at;
    job.updatedAt = job.updated_at;
    delete job.created_at;
    delete job.updated_at;
    
    return job;
  },
  
  // Get all jobs with optional filtering
  async findAll(filter = {}) {
    let query = `
      SELECT j.id, j.title, j.description, j.budget, j.category, j.skills, j.status, 
             j.user_id AS "userId", j.created_at, j.updated_at
      FROM jobs j
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
    
    query += ` ORDER BY j.created_at DESC`;
    
    const result = await db.query(query, params);
    
    // Convert snake_case to camelCase for each row
    return result.rows.map(job => {
      job.createdAt = job.created_at;
      job.updatedAt = job.updated_at;
      delete job.created_at;
      delete job.updated_at;
      return job;
    });
  },
  
  // Find job by ID
  async findById(jobId) {
    const result = await db.query(
      `SELECT j.id, j.title, j.description, j.budget, j.category, j.skills, j.status, 
              j.user_id AS "userId", j.created_at, j.updated_at
       FROM jobs j
       WHERE j.id = $1`,
      [jobId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const job = result.rows[0];
    job.createdAt = job.created_at;
    job.updatedAt = job.updated_at;
    delete job.created_at;
    delete job.updated_at;
    
    return job;
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
    
    // Add updated_at
    updates.push(`updated_at = NOW()`);
    
    // Add jobId to values array
    values.push(jobId);
    
    const query = `
      UPDATE jobs 
      SET ${updates.join(', ')} 
      WHERE id = $${values.length} 
      RETURNING id, title, description, budget, category, skills, status, user_id AS "userId", created_at, updated_at
    `;
    
    const result = await db.query(query, values);
    
    const job = result.rows[0];
    job.createdAt = job.created_at;
    job.updatedAt = job.updated_at;
    delete job.created_at;
    delete job.updated_at;
    
    return job;
  },
  
  // Delete a job
  async delete(jobId) {
    await db.query('DELETE FROM jobs WHERE id = $1', [jobId]);
    return true;
  }
};

module.exports = jobModel;
