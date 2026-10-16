// ============================================================================
// File: server/middleware/authMiddleware.js
// 1. What this file does:
//    Acts as a security bouncer. It checks if the user has a valid login token
//    (JWT) before letting them access protected pages or data.
// 2. Why this file exists:
//    To prevent strangers or unauthenticated users from seeing or changing private
//    purchase records.
// 3. Important points to remember:
//    - protect: The middleware function that guards private routes.
//    - Looks for the login token inside cookies or the request header.
//    - If valid, it attaches the user's info to 'req.user' (without the password).
//    - If missing or fake, it blocks the request with a 401 Unauthorized status.
// 4. How it connects to other parts:
//    - Used by 'routes/purchaseRoutes.js' and 'routes/dashboardRoutes.js' to keep them safe.
// ============================================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = null;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization header: "Bearer <token>"
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token is provided, reject request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in to access this resource.'
    });
  }

  try {
    // Verify token validity and expiration
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production_12345'
    );

    // Look up the user from database (exclude password field)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Attach authenticated user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error(`[AuthMiddleware] Token verification error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

module.exports = { protect };
