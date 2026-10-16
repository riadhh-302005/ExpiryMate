// ============================================================================
// File: server/models/User.js
// 1. What this file does:
//    Defines how user accounts are stored in MongoDB (name, email, and password).
// 2. Why this file exists:
//    MongoDB is flexible, so Mongoose schemas give our user data clear structure,
//    rules, and built-in password security.
// 3. Important points to remember:
//    - Automatically hashes passwords with bcryptjs before saving, so we never
//      store readable passwords in the database.
//    - comparePassword(): Safely checks if a password typed at login matches the hash.
//    - Forces emails to be unique and lowercase so no one registers twice.
// 4. How it connects to other parts:
//    - Used by 'controllers/authController.js' when users sign up and log in.
//    - Linked to 'models/Purchase.js' so every purchase belongs to a specific user.
// ============================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Do not include password in queries by default for safety
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Helper method to compare entered password with stored bcrypt hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
