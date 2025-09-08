const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
  origin: '*', // Consider restricting this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: 'application/octet-stream', limit: '200kb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/upload/image', express.static(path.join(__dirname, 'public/upload/image')));

// Root route
app.get('/', (req, res) => {
  res.json({ hello: 'hello' }); // Fixed response to send JSON properly
});

// Auth routes
app.use('/user', authRoutes);

// 404 Error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Export the app
module.exports = app;