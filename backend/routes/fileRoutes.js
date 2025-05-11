
const express = require('express');
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Upload a file
router.post('/', fileController.uploadFile);

// Get a file
router.get('/:fileId', fileController.getFile);

module.exports = router;
