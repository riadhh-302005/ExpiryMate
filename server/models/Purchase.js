// ============================================================================
// File: server/models/Purchase.js
// 1. What this file does:
//    Defines how purchase records are saved in MongoDB (product name, category,
//    price, purchase date, return deadline, warranty end date, and receipt link).
// 2. Why this file exists:
//    This is the main data model of ExpiryMate. It ensures every purchase has
//    all required fields and links directly to the user who bought it.
// 3. Important points to remember:
//    - user: Links this purchase to the specific logged-in user who created it.
//    - remindersSent: Keeps track of whether reminder emails were already sent
//      so we don't send duplicate emails.
//    - receiptUrl & receiptPublicId: Stores the receipt photo/PDF link and ID.
// 4. How it connects to other parts:
//    - Used by 'controllers/purchaseController.js' to create, edit, and delete purchases.
//    - Scanned by 'jobs/reminderJob.js' to find upcoming deadlines for email alerts.
// ============================================================================

const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Purchase must belong to a user'],
      index: true
    },
    productName: {
      type: String,
      required: [true, 'Please enter a product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: [
          'Electronics',
          'Appliances',
          'Furniture',
          'Clothing',
          'Home & Kitchen',
          'Health & Personal Care',
          'Groceries',
          'Other'
        ],
        message: '{VALUE} is not a supported category'
      },
      default: 'Other'
    },
    price: {
      type: Number,
      required: [true, 'Please enter the purchase price'],
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    seller: {
      type: String,
      trim: true,
      default: ''
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Please specify the date of purchase'],
      default: Date.now
    },
    returnDeadline: {
      type: Date,
      default: null
    },
    warrantyEndDate: {
      type: Date,
      default: null
    },
    receiptUrl: {
      type: String,
      default: ''
    },
    receiptPublicId: {
      type: String,
      default: ''
    },
    receiptFileType: {
      type: String,
      enum: ['image', 'pdf', 'none'],
      default: 'none'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: ''
    },
    remindersSent: {
      returnDeadline: {
        type: Boolean,
        default: false
      },
      warrantyExpiry: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
