
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT Middleware for REST API
const authenticateToken = (req, res, next) => {
  // Get token from header Authorization or query params
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // If no token in headers, try to get it from query params
  if (!token && req.query.token) {
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Socket.io Authentication Middleware
const authenticateSocketToken = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('No authentication token provided'));
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Invalid or expired token'));
    }
    socket.user = decoded;
    next();
  });
};

module.exports = {
  authenticateToken,
  authenticateSocketToken
};
