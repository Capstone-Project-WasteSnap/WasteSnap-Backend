const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Daftar origin yang diizinkan (frontend)
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // React dev server
  "http://172.20.224.1:3000", // Jaringan lokal
  "http://192.168.1.10:5173", // Tambahkan IP lokal di sini jika perlu
  "https://wastesnap-frontend.vercel.app",
];

// Middleware CORS
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Origin incoming:", origin); // Logging untuk debug

      // Izinkan request tanpa origin (Postman, curl, mobile app)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware lainnya
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/map", require("./routes/mapRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/scans", require("./routes/scanRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ message: "CORS blocked: Origin not allowed" });
  }
  res.status(500).json({ message: "Server error" });
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
