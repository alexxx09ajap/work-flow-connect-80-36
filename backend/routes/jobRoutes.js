
const express = require('express');
const jobController = require('../controllers/jobController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new job
router.post('/', jobController.createJob);

// Get all jobs with optional filtering
// Can now filter by userId with ?userId=xxx query parameter
router.get('/', jobController.getAllJobs);

// Get job by ID
router.get('/:jobId', jobController.getJobById);

// Update a job
router.put('/:jobId', jobController.updateJob);

// Delete a job
router.delete('/:jobId', jobController.deleteJob);

// Add comment to a job
router.post('/:jobId/comments', jobController.addComment);

// Add reply to a comment
router.post('/:jobId/comments/:commentId/replies', jobController.addReply);

// Add log to verify routes initialization
console.log('Job routes initialized correctly with userId filter support and improved deletion handling');

module.exports = router;
