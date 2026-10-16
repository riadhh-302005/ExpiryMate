// ============================================================================
// File: server/middleware/errorMiddleware.js
// 1. What this file does:
//    Catches errors across the backend and sends back friendly, helpful error messages
//    to the user instead of letting the server crash.
// 2. Why this file exists:
//    Having one central place for errors keeps our controllers clean and ensures
//    the frontend always receives a consistent error format.
// 3. Important points to remember:
//    - notFound: Runs when someone visits an API route that does not exist (returns 404).
//    - errorHandler: Catches database errors, invalid passwords, or file upload errors
//      and turns them into user-friendly JSON messages.
// 4. How it connects to other parts:
//    - Registered at the very bottom of 'server.js' so it catches any errors from routes.
// ============================================================================

const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for resource: ${err.value}`;
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size is too large. Receipts must be under 5MB.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};
