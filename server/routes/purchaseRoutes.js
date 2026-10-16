// ============================================================================
// File: server/routes/purchaseRoutes.js
// 1. What this file does:
//    Defines the web addresses (routes) for purchase operations: adding, viewing,
//    editing, and deleting purchases, plus uploading receipts.
// 2. Why this file exists:
//    It organizes all purchase-related URL routes in one place and protects them
//    so only logged-in users can use them.
// 3. Important points to remember:
//    - router.use(protect): Automatically locks ALL routes in this file so guests cannot enter.
//    - uploadReceipt.single('receipt'): Grabs any uploaded receipt file before passing data to the controller.
// 4. How it connects to other parts:
//    - Mounted at '/api/purchases' inside 'server.js'.
//    - Passes work to 'controllers/purchaseController.js'.
// ============================================================================

const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase
} = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');
const { uploadReceipt } = require('../middleware/uploadMiddleware');

// Protect all purchase routes
router.use(protect);

router
  .route('/')
  .post(uploadReceipt.single('receipt'), createPurchase)
  .get(getPurchases);

router
  .route('/:id')
  .get(getPurchaseById)
  .put(uploadReceipt.single('receipt'), updatePurchase)
  .delete(deletePurchase);

module.exports = router;
