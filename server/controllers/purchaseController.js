// ============================================================================
// File: server/controllers/purchaseController.js
// 1. What this file does:
//    Contains all the logic for purchases: adding a new item, viewing all items,
//    viewing one item, editing an item, and deleting an item along with its receipt.
// 2. Why this file exists:
//    This is the core business logic of ExpiryMate. It also makes sure users can
//    ONLY see and edit their own purchases, keeping everyone's data private.
// 3. Important points to remember:
//    - createPurchase: Saves a new purchase and attaches an uploaded receipt.
//    - getPurchases: Lets users search and filter their purchases by category or status.
//    - deletePurchase: Deletes the purchase from MongoDB and deletes the receipt photo.
//    - Security: Always checks that the logged-in user owns the item before letting them edit or delete.
// 4. How it connects to other parts:
//    - Called by 'routes/purchaseRoutes.js' when users perform actions on purchases.
//    - Saves data using 'models/Purchase.js'.
// ============================================================================

const Purchase = require('../models/Purchase');
const { processReceiptUpload, removeReceiptAsset } = require('../middleware/uploadMiddleware');
const { attachDynamicStatus } = require('../utils/dateCalculations');

/**
 * @route   POST /api/purchases
 * @desc    Create a new purchase with optional receipt upload
 * @access  Private
 */
const createPurchase = async (req, res, next) => {
  try {
    const {
      productName,
      category,
      price,
      seller,
      purchaseDate,
      returnDeadline,
      warrantyEndDate,
      notes
    } = req.body;

    // Validate required fields
    if (!productName || !productName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required.'
      });
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number.'
      });
    }

    if (!purchaseDate) {
      return res.status(400).json({
        success: false,
        message: 'Purchase date is required.'
      });
    }

    // Process file upload if provided
    let receiptData = { receiptUrl: '', receiptPublicId: '', receiptFileType: 'none' };
    if (req.file) {
      receiptData = await processReceiptUpload(req.file);
    }

    // Create the purchase document associated with the logged-in user
    const purchase = await Purchase.create({
      user: req.user._id,
      productName: productName.trim(),
      category: category || 'Other',
      price: parsedPrice,
      seller: (seller || '').trim(),
      purchaseDate: new Date(purchaseDate),
      returnDeadline: returnDeadline ? new Date(returnDeadline) : null,
      warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
      notes: (notes || '').trim(),
      receiptUrl: receiptData.receiptUrl,
      receiptPublicId: receiptData.receiptPublicId,
      receiptFileType: receiptData.receiptFileType
    });

    const enrichedPurchase = attachDynamicStatus(purchase);

    res.status(201).json({
      success: true,
      data: enrichedPurchase
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/purchases
 * @desc    Retrieve all purchases for the logged-in user with search, filter, and sorting
 * @access  Private
 */
const getPurchases = async (req, res, next) => {
  try {
    const { search, category, warrantyStatus, sortBy = 'purchaseDate', sortOrder = 'desc' } = req.query;

    // Base query always restricts to the logged-in user
    const query = { user: req.user._id };

    // Search filter (product name or seller)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ productName: searchRegex }, { seller: searchRegex }];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Fetch purchases from database
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const purchases = await Purchase.find(query).sort({ [sortBy]: sortDirection });

    // Enrich all purchases with dynamic real-time deadline statuses
    let enrichedPurchases = purchases.map((item) => attachDynamicStatus(item));

    // Optional filtering by dynamic warranty status ('active', 'expiring_soon', 'expired')
    if (warrantyStatus && warrantyStatus !== 'All') {
      enrichedPurchases = enrichedPurchases.filter(
        (item) => item.warrantyStatus.status === warrantyStatus
      );
    }

    res.status(200).json({
      success: true,
      count: enrichedPurchases.length,
      data: enrichedPurchases
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/purchases/:id
 * @desc    Get a single purchase by ID
 * @access  Private
 */
const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found.'
      });
    }

    // Strictly enforce ownership check
    if (purchase.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this purchase.'
      });
    }

    res.status(200).json({
      success: true,
      data: attachDynamicStatus(purchase)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/purchases/:id
 * @desc    Update purchase details and optionally replace receipt
 * @access  Private
 */
const updatePurchase = async (req, res, next) => {
  try {
    let purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found.'
      });
    }

    // Enforce ownership check
    if (purchase.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this purchase.'
      });
    }

    const {
      productName,
      category,
      price,
      seller,
      purchaseDate,
      returnDeadline,
      warrantyEndDate,
      notes
    } = req.body;

    // Update textual and date fields
    if (productName) purchase.productName = productName.trim();
    if (category) purchase.category = category;
    if (price !== undefined) purchase.price = Number(price);
    if (seller !== undefined) purchase.seller = seller.trim();
    if (purchaseDate) purchase.purchaseDate = new Date(purchaseDate);

    // If deadline or warranty dates changed, reset reminder sent flags if set into the future
    if (returnDeadline !== undefined) {
      const newDeadline = returnDeadline ? new Date(returnDeadline) : null;
      if (
        newDeadline &&
        (!purchase.returnDeadline ||
          new Date(newDeadline).getTime() !== new Date(purchase.returnDeadline).getTime())
      ) {
        purchase.remindersSent.returnDeadline = false;
      }
      purchase.returnDeadline = newDeadline;
    }

    if (warrantyEndDate !== undefined) {
      const newWarranty = warrantyEndDate ? new Date(warrantyEndDate) : null;
      if (
        newWarranty &&
        (!purchase.warrantyEndDate ||
          new Date(newWarranty).getTime() !== new Date(purchase.warrantyEndDate).getTime())
      ) {
        purchase.remindersSent.warrantyExpiry = false;
      }
      purchase.warrantyEndDate = newWarranty;
    }

    if (notes !== undefined) purchase.notes = notes.trim();

    // If a new receipt file is uploaded, remove the old one and save the new asset
    if (req.file) {
      await removeReceiptAsset(purchase.receiptPublicId, purchase.receiptUrl);
      const receiptData = await processReceiptUpload(req.file);
      purchase.receiptUrl = receiptData.receiptUrl;
      purchase.receiptPublicId = receiptData.receiptPublicId;
      purchase.receiptFileType = receiptData.receiptFileType;
    }

    await purchase.save();

    res.status(200).json({
      success: true,
      data: attachDynamicStatus(purchase)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/purchases/:id
 * @desc    Delete a purchase and clean up its Cloudinary receipt asset
 * @access  Private
 */
const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found.'
      });
    }

    // Enforce ownership check
    if (purchase.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this purchase.'
      });
    }

    // Clean up stored file from Cloudinary or local disk
    await removeReceiptAsset(purchase.receiptPublicId, purchase.receiptUrl);

    await purchase.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Purchase and associated receipt deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase
};
