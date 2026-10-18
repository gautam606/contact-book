
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // 1. Get the token from the request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Token is required."
            });
        }

        // 2. Extract the token
        const token = authHeader.split(" ")[1];

        // 3. Verify the token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 4. Store the user ID in the request
        req.userId = decoded.userId;

        // 5. Allow the request to continue
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;
