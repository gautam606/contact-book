
const express = require("express");
const router = express.Router();

const {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact
} = require("../controllers/contactController");

const authMiddleware = require("../middleware/authMiddleware");

// Create a contact
router.post("/", authMiddleware, createContact);

// Get all contacts belonging to the logged-in user
router.get("/", authMiddleware, getContacts);

// Get a specific contact by ID
router.get("/:id", authMiddleware, getContactById);

// Update a contact
router.put("/:id", authMiddleware, updateContact);

// Delete a contact
router.delete("/:id", authMiddleware, deleteContact);

module.exports = router;
