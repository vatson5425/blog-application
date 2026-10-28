const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Configure CORS
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5500';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || origin === 'null') return callback(null, true);
      
      // Allow configured CLIENT_ORIGIN, localhost, and 127.0.0.1 variants (with or without port)
      if (
        origin === allowedOrigin ||
        origin === 'http://localhost' ||
        origin === 'https://localhost' ||
        origin === 'http://127.0.0.1' ||
        origin === 'https://127.0.0.1' ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('https://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Configure Request Body JSON parsing with reasonable request-size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blog API server is running',
    timestamp: new Date().toISOString()
  });
});

// Mount Feature API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));

// 404 handler for unknown routes
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

/**
 * Start the server ONLY after the MongoDB connection succeeds
 */
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Blog API Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
