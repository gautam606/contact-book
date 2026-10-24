
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
        // The owner ID comes from the verified JWT.
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
        // 5. Handle duplicate email errors
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A contact with this email already exists."
            });
        }

        // 6. Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: error.message
            });
        }

        // 7. Handle unexpected errors
        console.error("Create contact error:", error);

        return res.status(500).json({
            message: "Failed to create contact."
        });
    }
};





const getContacts = async (req, res) => {
    try {
        const { search, sortBy, order } = req.query;

        // 1. Get pagination values from the URL
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const skip = (page - 1) * limit;

        // 2. Restrict results to the logged-in user
        const filter = {
            user_id: req.userId
        };

        // Filter by favorite status when requested
        if (req.query.favorite === "true") {
            filter.is_favorite = true;
        } else if (req.query.favorite === "false") {
            filter.is_favorite = false;
}

        // 3. Search by name, email, or phone
        if (search && search.trim()) {
            const searchTerm = search.trim();

            // Escape regex special characters in user input
            const escapedSearch = searchTerm.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                {
                    full_name: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },
                {
                    email: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                },
                {
                    phone: {
                        $regex: escapedSearch,
                        $options: "i"
                    }
                }
            ];
        }

        // 4. Get this page of contacts and the total matching count
        const [contacts, totalContacts] = await Promise.all([
            Contact.find(filter)
                .sort({
                    [sortBy === "created_at" ? "created_at" : "full_name"]:
                    order === "desc" ? -1 : 1,
                    _id: 1
})
                .skip(skip)
                .limit(limit),

            Contact.countDocuments(filter)
        ]);

        // 5. Return contacts and pagination details
        return res.status(200).json({
            message: "Contacts fetched successfully.",
            count: contacts.length,
            pagination: {
                totalContacts,
                currentPage: page,
                totalPages: Math.ceil(totalContacts / limit),
                limit
            },
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

        // 1. Validate the MongoDB ObjectId
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

        // 2. Accept only allowed fields
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        // 3. Prevent empty updates
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Please provide at least one field to update."
            });
        }

        // 4. Validate required fields when provided
        const requiredFields = [
            "full_name",
            "email",
            "phone",
            "address"
        ];

        for (const field of requiredFields) {
            if (
                updates[field] !== undefined &&
                (typeof updates[field] !== "string" ||
                    !updates[field].trim())
            ) {
                return res.status(400).json({
                    message: `${field} cannot be empty.`
                });
            }
        }

        // 5. Normalize and validate email
        if (typeof updates.email === "string") {
            updates.email = updates.email.trim().toLowerCase();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(updates.email)) {
                return res.status(400).json({
                    message: "Please enter a valid email address."
                });
            }
        }

        // 6. Trim text fields
        for (const field of [
            "full_name",
            "phone",
            "address",
            "company_name",
            "photo_path"
        ]) {
            if (typeof updates[field] === "string") {
                updates[field] = updates[field].trim();
            }
        }

        // 7. Find and update only this user's contact
        const contact = await Contact.findOneAndUpdate(
            {
                _id: id,
                user_id: req.userId
            },
            { $set: updates },
            {
                returnDocument: "after",
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
        // 8. Handle duplicate email
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A contact with this email already exists."
            });
        }

        // 9. Handle Mongoose validation errors
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


const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the MongoDB ObjectId
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

        // Toggle the favorite status
        contact.is_favorite = !contact.is_favorite;

        await contact.save();

        return res.status(200).json({
            message: contact.is_favorite
                ? "Contact added to favorites."
                : "Contact removed from favorites.",
            contact
        });

    } catch (error) {
        console.error("Toggle favorite error:", error);

        return res.status(500).json({
            message: "Failed to update favorite status."
        });
    }
};

const getFavoriteContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({
            user_id: req.userId,
            is_favorite: true
        }).sort({ full_name: 1 });

        return res.status(200).json({
            message: "Favorite contacts fetched successfully.",
            count: contacts.length,
            contacts
        });

    } catch (error) {
        console.error("Get favorite contacts error:", error);

        return res.status(500).json({
            message: "Failed to fetch favorite contacts."
        });
    }
};


const getContactStats = async (req, res) => {
    try {
        const userId = req.userId;

        const [totalContacts, favoriteContacts] = await Promise.all([
            Contact.countDocuments({ user_id: userId }),
            Contact.countDocuments({
                user_id: userId,
                is_favorite: true
            })
        ]);

        return res.status(200).json({
            totalContacts,
            favoriteContacts,
            nonFavoriteContacts: totalContacts - favoriteContacts
        });
    } catch (error) {
        console.error("Get contact stats error:", error);

        return res.status(500).json({
            message: "Failed to fetch contact statistics."
        });
    }
};


const checkContactEmail = async (req, res) => {
    try {
        const email = req.query.email?.trim().toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Please provide an email address."
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        const contactExists = await Contact.exists({
            user_id: req.userId,
            email: email
        });

        return res.status(200).json({
            email,
            exists: Boolean(contactExists),
            message: contactExists
                ? "This email already belongs to one of your contacts."
                : "This email is available."
        });
    } catch (error) {
        console.error("Check contact email error:", error);

        return res.status(500).json({
            message: "Failed to check email address."
        });
    }
};

module.exports = { createContact, getContacts, getContactById,updateContact,
     deleteContact, toggleFavorite, getFavoriteContacts, getContactStats, checkContactEmail };
