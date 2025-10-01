const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const admin = require('./services/firebaseAdmin');
const { getFirestore } = require('firebase-admin/firestore');

// Load environment variables
dotenv.config();

// Import routes
// New bus-tracker routes
const driverRoutes = require('./routes/driverRoutes');
const busRoutes = require('./routes/busRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = createServer(app);

// Initialize Socket.IO with flexible CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Initialize Firestore
const db = getFirestore();
console.log('✅ Connected to Firebase Firestore');

// In-memory mock buses for testing (Ludhiana, Punjab, India)
const mockBuses = [
  { id: 'LUD-101', location: { lat: 30.9010, lng: 75.8573 }, heading: 0, speed: 20, active: true },
  { id: 'LUD-202', location: { lat: 30.8898, lng: 75.8190 }, heading: 180, speed: 18, active: true },
  { id: 'LUD-303', location: { lat: 30.9272, lng: 75.8645 }, heading: 90, speed: 22, active: true },
];
app.locals.mockBuses = mockBuses;

// Helper to keep positions within Ludhiana bounds
const LUDHIANA_BOUNDS = { latMin: 30.85, latMax: 30.95, lngMin: 75.78, lngMax: 75.93 };
function clampLudhiana(lat, lng) {
  const clampedLat = Math.min(Math.max(lat, LUDHIANA_BOUNDS.latMin), LUDHIANA_BOUNDS.latMax);
  const clampedLng = Math.min(Math.max(lng, LUDHIANA_BOUNDS.lngMin), LUDHIANA_BOUNDS.lngMax);
  return { lat: clampedLat, lng: clampedLng };
}

// Simulate movement and broadcast every 2 seconds
setInterval(() => {
  mockBuses.forEach((bus) => {
    const deltaLat = (Math.random() - 0.5) * 0.0015; // ~0.15 km
    const deltaLng = (Math.random() - 0.5) * 0.0015;
    const next = clampLudhiana(bus.location.lat + deltaLat, bus.location.lng + deltaLng);
    bus.location = next;
    bus.heading = (bus.heading + Math.floor(Math.random() * 40) - 20 + 360) % 360;
    bus.speed = 15 + Math.random() * 15;
    const payload = { id: bus.id, active: true, location: bus.location, heading: bus.heading, speed: Math.round(bus.speed), updatedAt: new Date().toISOString() };
    io.emit('bus-location', payload);
  });
}, 2000);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration - allow multiple frontend ports
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Make Firestore and Socket.IO accessible to routes
app.use((req, res, next) => {
  req.db = db;
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'firestore',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes for bus tracker
app.use('/api/driver', driverRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: Firebase Firestore`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('⏳ Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
