
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
    // First, get the job details
    const jobResult = await db.query(
      `SELECT j.id, j.title, j.description, j.budget, j.category, j.skills, j.status, 
              j."userId", j."createdAt", j."updatedAt"
       FROM "Jobs" j
       WHERE j.id = $1`,
      [jobId]
    );
    
    if (jobResult.rows.length === 0) {
      return null;
    }
    
    const job = jobResult.rows[0];
    
    // Get comments for the job
    const commentsResult = await db.query(
      `SELECT c.id, c.content, c."userId", c.timestamp, u.name as "userName", u.avatar as "userPhoto"
       FROM "Comments" c
       JOIN "Users" u ON c."userId" = u.id
       WHERE c."jobId" = $1
       ORDER BY c.timestamp ASC`,
      [jobId]
    );
    
    // Get replies for each comment
    const comments = await Promise.all(commentsResult.rows.map(async (comment) => {
      const repliesResult = await db.query(
        `SELECT r.id, r.content, r."userId", r.timestamp, u.name as "userName", u.avatar as "userPhoto"
         FROM "Replies" r
         JOIN "Users" u ON r."userId" = u.id
         WHERE r."commentId" = $1
         ORDER BY r.timestamp ASC`,
        [comment.id]
      );
      
      return {
        ...comment,
        text: comment.content, // For compatibility with frontend
        replies: repliesResult.rows.map(reply => ({
          ...reply,
          text: reply.content // For compatibility with frontend
        }))
      };
    }));
    
    // Return job with comments
    return {
      ...job,
      comments
    };
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
  },
  
  // Add a comment to a job
  async addComment(jobId, comment) {
    const { content, userId } = comment;
    const id = uuidv4();
    const timestamp = new Date();
    
    // Insert the comment
    const result = await db.query(
      `INSERT INTO "Comments" (id, "jobId", "userId", content, timestamp) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, "jobId", "userId", content, timestamp`,
      [id, jobId, userId, content, timestamp]
    );
    
    // Get user info for the comment
    const userResult = await db.query(
      `SELECT name, avatar FROM "Users" WHERE id = $1`,
      [userId]
    );
    
    const user = userResult.rows[0] || { name: 'Usuario desconocido', avatar: null };
    
    // Return comment with user info
    return {
      ...result.rows[0],
      text: content, // For compatibility with frontend
      userName: user.name,
      userPhoto: user.avatar,
      replies: []
    };
  },
  
  // Add a reply to a comment
  async addReplyToComment(jobId, commentId, reply) {
    const { content, userId } = reply;
    const id = uuidv4();
    const timestamp = new Date();
    
    // Verify that the comment exists and belongs to the specified job
    const commentCheck = await db.query(
      `SELECT id FROM "Comments" WHERE id = $1 AND "jobId" = $2`,
      [commentId, jobId]
    );
    
    if (commentCheck.rows.length === 0) {
      throw new Error('Comment not found or does not belong to the specified job');
    }
    
    // Insert the reply
    const result = await db.query(
      `INSERT INTO "Replies" (id, "commentId", "userId", content, timestamp) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, "commentId", "userId", content, timestamp`,
      [id, commentId, userId, content, timestamp]
    );
    
    // Get user info for the reply
    const userResult = await db.query(
      `SELECT name, avatar FROM "Users" WHERE id = $1`,
      [userId]
    );
    
    const user = userResult.rows[0] || { name: 'Usuario desconocido', avatar: null };
    
    // Return reply with user info
    return {
      ...result.rows[0],
      text: content, // For compatibility with frontend
      userName: user.name,
      userPhoto: user.avatar
    };
  }
};

module.exports = jobModel;
