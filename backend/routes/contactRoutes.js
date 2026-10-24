
const express = require("express");
const router = express.Router();

const {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact,
    toggleFavorite,
    getFavoriteContacts,
    getContactStats,
    checkContactEmail
} = require("../controllers/contactController");

const authMiddleware = require("../middleware/authMiddleware");

// Create a contact
router.post("/", authMiddleware, createContact);

// Get all contacts
router.get("/", authMiddleware, getContacts);

// Get favorite contacts — must be before /:id
router.get("/favorites", authMiddleware, getFavoriteContacts);

router.get("/stats", authMiddleware, getContactStats);

// Check email — must be before /:id
router.get("/check-email", authMiddleware, checkContactEmail);

// Get a specific contact by ID
router.get("/:id", authMiddleware, getContactById);

// Update a contact
router.put("/:id", authMiddleware, updateContact);

// Delete a contact
router.delete("/:id", authMiddleware, deleteContact);

// Toggle favorite status
router.patch("/:id/favorite", authMiddleware, toggleFavorite);

module.exports = router;
