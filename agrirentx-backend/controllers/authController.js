const jwt = require("jsonwebtoken");
const User = require("../models/user");
const asyncHandler = require("../middleware/asyncHandler");


const {
    sendWelcomeEmail,
} = require("../services/emailService");

const {
    sendOTP,
} = require("../services/smsService");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

// =========================================
// Register
// =========================================
const register = async (req, res, next) => {
  try {
    const { error } = registerValidator.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      fullName,
      email,
      phone,
      password,
      role,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      is_farmer: role !== "rentaler",
      is_rentaler: role === "rentaler",
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();
await sendWelcomeEmail(user);

await sendOTP({
    phone: user.phone,
    otp: "123456", // Temporary (replace with generated OTP later)
});
    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: userData,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    next(error);
  }
};

// =========================================
// Login
// =========================================
const login = async (req, res, next) => {
  try {
    const { error } = loginValidator.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();

    await user.save();

    const userData = user.toObject();
    delete userData.password;
    delete userData.refreshToken;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: userData,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    next(error);
  }
};

// =========================================
// Refresh Token
// =========================================
// =========================================
// Refresh Token
// =========================================
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken,
    });

  } catch (error) {

    next(error);
  }
};



// =========================================
// Logout
// =========================================
// =========================================
// Logout
// =========================================
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Remove stored refresh token
    user.refreshToken = "";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });

  } catch (error) {

    next(error);
  }
};

// =========================================
// Get Current User
// =========================================
// =========================================
// Get Current User
// =========================================
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
});


// =========================================
// Upgrade Farmer → Rentaler
// =========================================
const upgradeToRentaler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.is_rentaler) {
      return res.status(400).json({
        success: false,
        message: "User is already a rentaler.",
      });
    }

    user.is_rentaler = true;
    user.rentaler_status = "pending";

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Rentaler request submitted successfully.",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        is_rentaler: user.is_rentaler,
        rentaler_status: user.rentaler_status,
      },
    });

  } catch (error) {

    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  upgradeToRentaler,
};