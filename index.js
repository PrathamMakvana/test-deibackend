const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const routes = require("./src/routes"); 
const cors = require("cors");

dotenv.config();

const app = express();

// Validate required env variables
if (!process.env.MONGODB_URL) {
  console.error("MONGO_URI not set in .env");
  process.exit(1);
}

// Middleware
app.use(cors({ origin: "*" }));

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

// API routes
app.use("/api", routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// Connect DB & Start server
const PORT = process.env.PORT || 5002;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
