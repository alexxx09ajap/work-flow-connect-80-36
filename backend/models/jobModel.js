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
    
    if (filter.userId) {
      params.push(filter.userId);
      conditions.push(`j."userId" = $${params.length}`);
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
    
    const job = result.rows[0];
    
    // Get comments for this job
    job.comments = await jobModel.getComments(jobId);
    
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

  // Get all comments for a job with their replies
  async getComments(jobId) {
    try {
      // First, get all comments for the job
      const commentsResult = await db.query(
        `SELECT c.id, c.content, c."jobId", c."userId", c."createdAt", c."updatedAt",
                u.name as "userName", u."photoURL" as "userPhoto"
         FROM "Comments" c
         JOIN "Users" u ON c."userId" = u.id
         WHERE c."jobId" = $1
         ORDER BY c."createdAt" ASC`,
        [jobId]
      );

      const comments = commentsResult.rows;
      console.log(`Found ${comments.length} comments for job ${jobId}`);

      // For each comment, get its replies
      for (const comment of comments) {
        const repliesResult = await db.query(
          `SELECT r.id, r.content, r."userId", r."commentId", r."createdAt", r."updatedAt",
                  u.name as "userName", u."photoURL" as "userPhoto"
           FROM "Replies" r
           JOIN "Users" u ON r."userId" = u.id
           WHERE r."commentId" = $1
           ORDER BY r."createdAt" ASC`,
          [comment.id]
        );

        // Format the comment and replies to match frontend expectations
        comment.text = comment.content;
        comment.timestamp = new Date(comment.createdAt).getTime();
        comment.replies = repliesResult.rows.map(reply => ({
          ...reply,
          text: reply.content,
          timestamp: new Date(reply.createdAt).getTime()
        }));
      }

      return comments;
    } catch (error) {
      console.error(`Error getting comments for job ${jobId}:`, error);
      return [];
    }
  },

  // Add a comment to a job
  async addComment(jobId, commentData) {
    const { content, userId } = commentData;
    const id = uuidv4();
    const now = new Date();

    const result = await db.query(
      `INSERT INTO "Comments" (id, content, "jobId", "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, content, "jobId", "userId", "createdAt", "updatedAt"`,
      [id, content, jobId, userId, now, now]
    );

    const comment = result.rows[0];

    // Get user information for the comment
    const userResult = await db.query(
      `SELECT name, "photoURL" FROM "Users" WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      comment.userName = user.name;
      comment.userPhoto = user.photoURL;
    }

    // Format the comment to match frontend expectations
    comment.text = comment.content;
    comment.timestamp = new Date(comment.createdAt).getTime();
    comment.replies = [];

    return comment;
  },

  // Add a reply to a comment
  async addReplyToComment(commentId, replyData) {
    const { content, userId } = replyData;
    const id = uuidv4();
    const now = new Date();

    const result = await db.query(
      `INSERT INTO "Replies" (id, content, "userId", "commentId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, content, "userId", "commentId", "createdAt", "updatedAt"`,
      [id, content, userId, commentId, now, now]
    );

    const reply = result.rows[0];

    // Get user information for the reply
    const userResult = await db.query(
      `SELECT name, "photoURL" FROM "Users" WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      reply.userName = user.name;
      reply.userPhoto = user.photoURL;
    }

    // Format the reply to match frontend expectations
    reply.text = reply.content;
    reply.timestamp = new Date(reply.createdAt).getTime();

    return reply;
  }
};

module.exports = jobModel;
