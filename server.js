const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const mapRoutes = require("./routes/mapRoutes");
const eventRoutes = require("./routes/eventRoutes");
const scanRoutes = require("./routes/scanRoutes");

const app = express();

// Enhanced allowed origins with duplicates removed
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://172.20.224.1:3000",
  "http://192.168.1.10:5173",
  "https://wastesnap-frontend.netlify.app",
  "https://wastesnap-frontend.vercel.app",
  "https://wastesnap-backend-production.up.railway.app"
];

// Optimized CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check against allowed origins with more flexible matching
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || 
      origin.endsWith(new URL(allowed).hostname)
    );

    if (isAllowed) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept"
  ],
  exposedHeaders: [
    "Content-Length",
    "Authorization"
  ],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", corsOptions.methods.join(","));
  res.header("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(","));
  res.header("Access-Control-Allow-Credentials", "true");
  res.status(204).end();
});

// Middleware for JSON parsing with limit
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/scans", scanRoutes);

// Enhanced health check endpoint
app.get("/api/health", (req, res) => {
  const healthCheck = {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    environment: process.env.NODE_ENV || "development"
  };
  res.status(200).json(healthCheck);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      error: "Forbidden",
      message: err.message,
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin,
      documentation: "https://enable-cors.org/"
    });
  }
  
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "production" 
      ? "Something went wrong" 
      : err.message
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🛡️  Allowed CORS origins:", allowedOrigins);
});

// Handle server timeouts
server.keepAliveTimeout = 60000; // 60 seconds
server.headersTimeout = 65000; // 65 seconds
