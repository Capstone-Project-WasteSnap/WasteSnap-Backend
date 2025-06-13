const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const mapRoutes = require("./routes/mapRoutes");
const eventRoutes = require("./routes/eventRoutes");
const scanRoutes = require("./routes/scanRoutes");

const app = express();

// Allowed origins with more flexible matching
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://172.20.224.1:3000",
  "http://192.168.1.10:5173",
  "https://wastesnap-frontend.vercel.app",
  "https://wastesnap-frontend.netlify.app",
  "https://wastesnap-backend-production.up.railway.app"
];

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or contains vercel/netlify/railway
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".netlify.app") ||
      origin.endsWith(".railway.app")
    ) {
      return callback(null, true);
    }
    
    const error = new Error(`CORS blocked for origin: ${origin}`);
    console.error(error.message);
    return callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept"
  ],
  optionsSuccessStatus: 200, // For legacy browser support
  preflightContinue: false
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Explicitly handle OPTIONS requests for all routes
app.options("*", cors(corsOptions));

// Add manual CORS headers as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some(allowed => origin.includes(allowed))) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Middleware parsing JSON
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/scans", scanRoutes);

// Special handling for OPTIONS on auth login
app.options("/api/auth/login", cors(corsOptions));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK",
    allowedOrigins: allowedOrigins,
    currentTime: new Date().toISOString()
  });
});

// Enhanced global error handler
app.use((err, req, res, next) => {
  console.error("[Global Error]", err.stack);
  
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      error: "CORS Error",
      message: err.message,
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin || "none",
      documentation: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"
    });
  }
  
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins);
  console.log(`CORS configuration:`, corsOptions);
});
