const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  require("cors")({
    origin: [
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/rentals", require("./routes/rentalRoutes"));
app.use("/api/branches", require("./routes/branchRoutes"));

// Admin routes
app.use("/api/admin/rentals", require("./routes/rentalRoutes"));
app.use("/api/admin/users", require("./routes/userRoutes"));
app.use("/api/admin/cars", require("./routes/carRoutes"));
app.use("/api/admin/branches", require("./routes/branchRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
