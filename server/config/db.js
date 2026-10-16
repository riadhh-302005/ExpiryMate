// ============================================================================
// File: server/config/db.js
// 1. What this file does:
//    Connects our Node.js backend to our MongoDB database using Mongoose.
// 2. Why this file exists:
//    It keeps our database setup code in one clean place instead of crowding server.js.
// 3. Important points to remember:
//    - Reads MONGODB_URI from our .env file (defaults to local MongoDB).
//    - If the database fails to connect, it logs the error and stops the app
//      so we don't run a broken server.
// 4. How it connects to other parts:
//    - Called by 'server.js' when the server boots up, before any user requests arrive.
// ============================================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expirymate';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
