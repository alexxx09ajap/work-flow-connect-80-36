
const express = require('express');
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');
const fileModel = require('../models/fileModel');

const router = express.Router();

router.use(authenticateToken);

// Middleware to ensure the Files table exists before processing any file requests
router.use(async (req, res, next) => {
  try {
    await fileModel.ensureFilesTableExists();
    next();
  } catch (error) {
    console.error('Error verifying Files table:', error);
    res.status(500).json({ message: 'Error interno del servidor al verificar tablas de archivos' });
  }
});

// Upload a file
router.post('/', fileController.uploadFile);

// Get a file
router.get('/:fileId', fileController.getFile);

// Delete a file
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
