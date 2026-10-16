// ============================================================================
// File: server/controllers/authController.js
// 1. What this file does:
//    Contains the logic for user accounts: registering a new user, logging in,
//    logging out, and checking who is currently logged in.
// 2. Why this file exists:
//    Separates the user login/signup code from the route definitions so everything
//    stays organized and easy to maintain.
// 3. Important points to remember:
//    - register: Checks if the email is already taken, hashes the password, and creates the user.
//    - login: Verifies the email and password, then creates a secure JWT login token.
//    - logout: Clears the login cookie so the user is signed out.
//    - sendTokenResponse: Sends the login token back inside a secure HTTP-only cookie.
// 4. How it connects to other parts:
//    - Called by 'routes/authRoutes.js' when users visit /api/auth/register or /api/auth/login.
//    - Reads and saves user data using 'models/User.js'.
// ============================================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Signs a JWT with the user's MongoDB ObjectId.
 * @param {string} id User ID
 * @returns {string} Signed JWT
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production_12345',
    { expiresIn: '30d' }
  );
};

/**
 * Sets an HTTP-only cookie and returns JSON with token and user details.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie (XSS protection)
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Create user (password is automatically hashed by pre-save hook in User model)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and issue token
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Explicitly select password since it has select: false in schema
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user and clear auth cookie
 * @access  Public
 */
const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};

/**
 * @route   GET /api/auth/me
 * @desc    Retrieve profile of currently authenticated user
 * @access  Private
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
