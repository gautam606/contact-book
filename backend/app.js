const express = require("express");
const cors = require("cors");
const app = express();

// Middleware to read JSON request bodies
app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173"
}));


// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contacts", contactRoutes);

const authMiddleware = require("./middleware/authMiddleware");
app.get("/api/auth/profile", authMiddleware, (req, res) => {
    res.status(200).json({
        message: "Protected route accessed successfully",
        userId: req.userId
    });
});


app.get("/", (req, res) => {
    res.status(200).json({
        message: "Contact Book API is running"
    });
});

module.exports = app;