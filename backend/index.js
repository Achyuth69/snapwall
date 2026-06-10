import express from "express";
import cors from "cors";
import authRoutes from "./routes/auths.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";

const app = express();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check route
app.get("/", (req, res) => {
  res.status(200).send("Backend running on Vercel 🚀");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/promotions", promotionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server locally (not used on Vercel)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
