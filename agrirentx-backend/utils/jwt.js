const jwt = require("jsonwebtoken");

// Generate Access Token (expires in 1 hour)
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            isAdmin: user.isAdmin,
            is_rentaler: user.is_rentaler,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h",
        }
    );
};

// Generate Refresh Token (expires in 7 days)
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
};