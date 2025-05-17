
const jobModel = require('../models/jobModel');
const userModel = require('../models/userModel');

const jobController = {
  // Create a new job
  async createJob(req, res) {
    try {
      const { title, description, budget, category, skills } = req.body;
      const userId = req.user.userId;
      
      console.log('Creating job with data:', { title, description, budget, category, skills, userId });
      
      // Validate required fields
      if (!title || !description || !budget || !category) {
        console.error('Missing required fields:', { title, description, budget, category });
        return res.status(400).json({
          success: false,
          message: 'Missing required fields (title, description, budget, category)'
        });
      }
      
      // Create the job
      const job = await jobModel.create({
        title,
        description,
        budget: parseFloat(budget),
        category,
        skills: Array.isArray(skills) ? skills : [],
        userId
      });
      
      console.log('Job created successfully:', job);
      
      // Get user info for the response
      const user = await userModel.findById(userId);
      
      const jobWithUser = {
        ...job,
        userName: user ? user.name : 'Usuario desconocido',
        userPhoto: user ? user.avatar : null
      };
      
      return res.status(201).json({
        success: true,
        message: 'Job created successfully',
        job: jobWithUser
      });
      
    } catch (error) {
      console.error('Error creating job:', error);
      
      // Proporcionar un mensaje más descriptivo basado en el error
      let errorMessage = 'Error creating job';
      if (error.code === '23502') { // Error de restricción de no nulo
        errorMessage = `Required field "${error.column}" cannot be null`;
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: error.message,
        details: error.detail || null,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },
  
  // Get all jobs with filters
  async getAllJobs(req, res) {
    try {
      const { category, search, status, userId } = req.query;
      
      const filter = {};
      
      // Filter by category
      if (category) {
        filter.category = category;
      }
      
      // Filter by status
      if (status) {
        filter.status = status;
      }
      
      // Filter by userId (new filter)
      if (userId) {
        filter.userId = userId;
      }
      
      // Search by title or description (simplified for PostgreSQL)
      if (search) {
        filter.search = search;
      }
      
      const jobs = await jobModel.findAll(filter);
      
      // Get user info for each job
      const jobsWithUserInfo = await Promise.all(jobs.map(async (job) => {
        const user = await userModel.findById(job.userId);
        return {
          ...job,
          userName: user ? user.name : 'Usuario desconocido',
          userPhoto: user ? user.avatar : null
        };
      }));
      
      return res.status(200).json({
        success: true,
        jobs: jobsWithUserInfo
      });
      
    } catch (error) {
      console.error('Error getting jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting jobs',
        error: error.message
      });
    }
  },
  
  // Get job by ID
  async getJobById(req, res) {
    try {
      const { jobId } = req.params;
      
      console.log(`Getting job by ID: ${jobId}`);
      
      const job = await jobModel.findById(jobId);
      
      if (!job) {
        console.error(`Job with ID ${jobId} not found`);
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Get user info
      const user = await userModel.findById(job.userId);
      
      const jobWithUser = {
        ...job,
        userName: user ? user.name : 'Usuario desconocido',
        userPhoto: user ? user.avatar : null
      };
      
      console.log(`Job found: ${job.id}, title: ${job.title}`);
      
      return res.status(200).json({
        success: true,
        job: jobWithUser
      });
      
    } catch (error) {
      console.error('Error getting job by ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Error getting job',
        error: error.message
      });
    }
  },
  
  // Update a job
  async updateJob(req, res) {
    try {
      const { jobId } = req.params;
      const { title, description, budget, category, skills, status } = req.body;
      const userId = req.user.userId;
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Verify user is the owner
      if (job.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to edit this job'
        });
      }
      
      // Update job
      const updatedData = {};
      if (title) updatedData.title = title;
      if (description) updatedData.description = description;
      if (budget) updatedData.budget = parseFloat(budget);
      if (category) updatedData.category = category;
      if (skills) updatedData.skills = skills;
      if (status) updatedData.status = status;
      
      const updatedJob = await jobModel.update(jobId, updatedData);
      
      // Get user info for the response
      const user = await userModel.findById(userId);
      
      const jobWithUser = {
        ...updatedJob,
        userName: user ? user.name : 'Usuario desconocido',
        userPhoto: user ? user.avatar : null
      };
      
      return res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        job: jobWithUser
      });
      
    } catch (error) {
      console.error('Error updating job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating job',
        error: error.message
      });
    }
  },
  
  // Delete a job
  async deleteJob(req, res) {
    try {
      const { jobId } = req.params;
      const userId = req.user.userId;
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Verify user is the owner
      if (job.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this job'
        });
      }
      
      // Delete job
      await jobModel.delete(jobId);
      
      return res.status(200).json({
        success: true,
        message: 'Job deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting job:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting job',
        error: error.message
      });
    }
  },
  
  // Add comment to a job
  async addComment(req, res) {
    try {
      const { jobId } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Comment content is required"
        });
      }
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Add comment to job
      const comment = await jobModel.addComment(jobId, { content, userId });

      console.log("Added comment to database:", comment);
      
      return res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        comment
      });
      
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error adding comment',
        error: error.message
      });
    }
  },
  
  // Add reply to a comment
  async addReply(req, res) {
    try {
      const { jobId, commentId } = req.params;
      const { content } = req.body;
      const userId = req.user.userId;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          message: "Reply content is required"
        });
      }
      
      // Check if job exists
      const job = await jobModel.findById(jobId);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Check if comment exists
      const commentExists = job.comments.some(comment => comment.id === commentId);
      if (!commentExists) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      
      // Add reply to comment
      const reply = await jobModel.addReplyToComment(commentId, { content, userId });
      
      console.log("Added reply to database:", reply);
      
      return res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        reply
      });
      
    } catch (error) {
      console.error('Error adding reply:', error);
      return res.status(500).json({
        success: false,
        message: 'Error adding reply',
        error: error.message
      });
    }
  }
};

module.exports = jobController;
