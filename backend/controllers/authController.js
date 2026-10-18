
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, confirmPassword } = req.body;

    // 1. Check required fields
    if (!full_name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 2. Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match"
      });
    }

    // 3. Check if the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    // 4. Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // 5. Create the user
    const user = await User.create({
      full_name,
      email,
      password_hash
    });

    // 6. Send the response
    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Server error during registration"
    });
  }
};



const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find the user by email
        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 3. Compare password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 5. Send response
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                full_name: user.full_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error during login"
        });
    }
};

module.exports = { registerUser, loginUser };
