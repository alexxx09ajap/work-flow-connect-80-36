
const express = require('express');
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');
const fileModel = require('../models/fileModel');

const router = express.Router();

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

// Apply authentication to all routes except those that explicitly check for token in query
router.use((req, res, next) => {
  // If the request is for downloading a file and has a token in the query
  if (req.path.match(/^\/\d+$/) && req.method === 'GET' && req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  
  // Continue to authentication middleware
  authenticateToken(req, res, next);
});

// Upload a file - Cambiamos directamente a la ruta root para coincidir con fileService
router.post('/', fileController.uploadFile);

// Get a file
router.get('/:fileId', fileController.getFile);

// Delete a file
router.delete('/:fileId', fileController.deleteFile);

module.exports = router;
