
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        full_name: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"]
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            maxlength: [255, "Email cannot exceed 255 characters"],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address"
            ]
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            maxlength: [20, "Phone cannot exceed 20 characters"]
        },

        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
            maxlength: [255, "Address cannot exceed 255 characters"]
        },

        company_name: {
            type: String,
            trim: true,
            maxlength: [100, "Company name cannot exceed 100 characters"],
            default: ""
        },

        photo_path: {
            type: String,
            default: ""
        },

        is_favorite: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

// Prevent duplicate email addresses for the same user.
contactSchema.index(
    { user_id: 1, email: 1 },
    { unique: true }
);

// Help retrieve a user's contacts in alphabetical order.
contactSchema.index({ user_id: 1, full_name: 1 });

// Help retrieve a user's favorite contacts.
contactSchema.index({ user_id: 1, is_favorite: 1 });

module.exports = mongoose.model("Contact", contactSchema);
