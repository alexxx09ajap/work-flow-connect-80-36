
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const { authenticateSocketToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const fileRoutes = require('./routes/fileRoutes');

// Socket handler
const socketHandler = require('./socket/socketHandler');

// Create Express app
const app = express();
const server = http.createServer(app);

// CORS config
const corsOptions = {
  origin: '*',  // In production, replace with specific origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);

// Socket.IO setup
const io = socketIo(server, {
  cors: corsOptions
});

// Socket authentication middleware
io.use(authenticateSocketToken);

// Initialize socket handler
const socketService = socketHandler(io);

// Store io instance and socket service on app for use in routes
app.set('io', io);
app.set('socketService', socketService);

// Default route
app.get('/', (req, res) => {
  res.send('WorkFlowConnect API is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
