
const Contact = require("../models/Contact");
const mongoose = require("mongoose");

const createContact = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone,
            address,
            company_name,
            photo_path
        } = req.body;

        // 1. Check required fields
        if (
            !full_name?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !address?.trim()
        ) {
            return res.status(400).json({
                message: "Name, email, phone, and address are required."
            });
        }

        // 2. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // 3. Create the contact
        // The owner ID comes from the verified JWT, not the request body.
        const contact = await Contact.create({
            user_id: req.userId,
            full_name: full_name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            address: address.trim(),
            company_name: company_name?.trim() || "",
            photo_path: photo_path?.trim() || ""
        });

        // 4. Send the saved contact back
        return res.status(201).json({
            message: "Contact created successfully.",
            contact
        });

    } catch (error) {
        // Duplicate email for this user
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A contact with this email already exists."
            });
        }

        // Mongoose validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Create contact error:", error);

        return res.status(500).json({
            message: "Failed to create contact."
        });
    }
};



const getContacts = async (req, res) => {
    try {
        // Get only the contacts belonging to the logged-in user
        const contacts = await Contact.find({
            user_id: req.userId
        }).sort({ full_name: 1 });

        return res.status(200).json({
            message: "Contacts fetched successfully.",
            count: contacts.length,
            contacts
        });

    } catch (error) {
        console.error("Get contacts error:", error);

        return res.status(500).json({
            message: "Failed to fetch contacts."
        });
    }
};


const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check whether the ID is a valid MongoDB ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid contact ID."
            });
        }

        // Find the contact owned by the logged-in user
        const contact = await Contact.findOne({
            _id: id,
            user_id: req.userId
        });

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found."
            });
        }

        return res.status(200).json({
            message: "Contact fetched successfully.",
            contact
        });

    } catch (error) {
        console.error("Get contact by ID error:", error);

        return res.status(500).json({
            message: "Failed to fetch contact."
        });
    }
};


const updateContact = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the MongoDB ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid contact ID."
            });
        }

        const allowedFields = [
            "full_name",
            "email",
            "phone",
            "address",
            "company_name",
            "photo_path",
            "is_favorite"
        ];

        const updates = {};

        // Accept only fields that users are allowed to update
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // Normalize email
        if (typeof updates.email === "string") {
            updates.email = updates.email.trim().toLowerCase();
        }

        // Find and update only this user's contact
        const contact = await Contact.findOneAndUpdate(
            {
                _id: id,
                user_id: req.userId
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found."
            });
        }

        return res.status(200).json({
            message: "Contact updated successfully.",
            contact
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A contact with this email already exists."
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error("Update contact error:", error);

        return res.status(500).json({
            message: "Failed to update contact."
        });
    }
};



const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the MongoDB ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid contact ID."
            });
        }

        // Delete only a contact owned by the logged-in user
        const contact = await Contact.findOneAndDelete({
            _id: id,
            user_id: req.userId
        });

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found."
            });
        }

        return res.status(200).json({
            message: "Contact deleted successfully."
        });

    } catch (error) {
        console.error("Delete contact error:", error);

        return res.status(500).json({
            message: "Failed to delete contact."
        });
    }
};

module.exports = { createContact, getContacts, getContactById,updateContact, deleteContact };
