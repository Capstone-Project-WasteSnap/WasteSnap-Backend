const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const mapRoutes = require("./routes/mapRoutes");
const eventRoutes = require("./routes/eventRoutes");
const scanRoutes = require("./routes/scanRoutes");

const app = express();

//  Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://172.20.224.1:3000",
  "http://192.168.1.10:5173",
  "https://wastesnap-frontend.vercel.app",
  "https://wastesnap-backend-production.up.railway.app"
];

//  CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan Postman/cURL
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//  Middleware parsing JSON
app.use(express.json());

//  Routes
app.use("/api/auth", authRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/scans", scanRoutes);

//  Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

//  Global error handler
app.use((err, req, res, next) => {
  console.error("[Global Error]", err.stack);
  if (err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ message: "CORS blocked: Origin not allowed" });
  }
  res.status(500).json({ message: "Internal server error" });
});

//  Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
