
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
const jobRoutes = require('./routes/jobRoutes');

// Socket handler
const socketHandler = require('./socket/socketHandler');

// Importar el script de verificación de esquema
const { checkAndUpdateDbSchema } = require('./scripts/checkDbSchema');
const fileModel = require('./models/fileModel');

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
app.use('/api/jobs', jobRoutes);

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

// Iniciar el servidor con socket.io
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT} with Socket.IO support`);
  
  try {
    // Verificar y actualizar el esquema de la base de datos al iniciar
    await checkAndUpdateDbSchema();
    
    // Asegurarnos de que las columnas necesarias existan en la tabla Messages
    const messageModel = require('./models/messageModel');
    await messageModel.addDeletedColumn();
    await messageModel.addEditedColumn();
    
    // Asegurar que la tabla Files exista
    const filesTableCreated = await fileModel.ensureFilesTableExists();
    if (filesTableCreated) {
      console.log('Tabla Files creada al iniciar el servidor');
    } else {
      console.log('Tabla Files verificada correctamente');
    }
    
    console.log('Verificación de esquema de base de datos completada con éxito');
  } catch (err) {
    console.error('Error al verificar/actualizar esquema de base de datos:', err);
    console.log('ADVERTENCIA: La aplicación puede no funcionar correctamente si faltan tablas o columnas');
  }
});
