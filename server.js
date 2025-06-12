const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Konfigurasi CORS yang diperbarui
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://172.20.224.1:3000", // Alamat frontend Anda
  "http://localhost:3000", // Alternatif localhost
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan request tanpa origin (seperti Postman atau mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Tambahkan OPTIONS
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === "Not allowed by CORS") {
    return res
      .status(403)
      .json({ message: "CORS blocked: Origin not allowed" });
  }
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
