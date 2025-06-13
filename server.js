const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes dengan cara yang aman
const authRoutes = require('./routes/authRoutes');
const mapRoutes = require('./routes/mapRoutes');
const eventRoutes = require('./routes/eventRoutes');
const scanRoutes = require('./routes/scanRoutes');

const app = express();

// Konfigurasi CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://wastesnap-frontend.netlify.app',
  'https://wastesnap-backend-production.up.railway.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Middleware untuk menangkap error route yang tidak valid
app.use((req, res, next) => {
  try {
    next();
  } catch (err) {
    if (err.message.includes('path-to-regexp')) {
      console.error('Invalid route detected:', {
        path: req.path,
        method: req.method,
        error: err.message
      });
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Invalid route pattern'
      });
    }
    next(err);
  }
});

// Body parser dengan limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Load routes dengan error handling
function loadRoutes() {
  try {
    app.use('/api/auth', authRoutes);
    app.use('/api/map', mapRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/scans', scanRoutes);
    
    console.log('All routes loaded successfully');
  } catch (err) {
    console.error('Failed to load routes:', err);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handler khusus untuk route
app.use((err, req, res, next) => {
  if (err.message.includes('path-to-regexp')) {
    return res.status(500).json({
      error: 'Invalid Route Configuration',
      message: 'Server has invalid route patterns',
      documentation: 'https://expressjs.com/en/guide/routing.html'
    });
  }
  next(err);
});

// Inisialisasi server
const PORT = process.env.PORT || 5000;

loadRoutes();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});
