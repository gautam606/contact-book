const express = require("express");
const app = express();

// Middleware to read JSON request bodies
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Contact Book API is running"
    });
});

module.exports = app;