// ============================================================================
// File: client/src/pages/AddPurchasePage.jsx
// 1. What this file does:
//    Displays a clean form where users can add a new purchase by entering
//    the product name, price in Rupees (₹), store name, dates, warranty end date,
//    and uploading a photo or PDF of the receipt.
// 2. Why this file exists in the application:
//    Provides a simple way for users to save new items into their account.
// 3. Important points to remember:
//    - Uses `FormData` to send both text fields and the uploaded receipt file together.
//    - Includes an optional OCR scanner button that reads the receipt image to fill
//      in the fields automatically.
//    - Checks that required fields are filled and that the price is not negative.
// 4. How it connects to other parts of the application:
//    Opened at `/purchases/new` and calls `createPurchase()` in `purchaseService.js`.
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Calendar,
  Store,
  Tag,
  FileText,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { createPurchase } from '../services/purchaseService';
import { formatInputDate } from '../utils/dateUtils';
import OcrScanner from '../components/purchases/OcrScanner';

const CATEGORIES = [
  'Electronics',
  'Appliances',
  'Furniture',
  'Clothing',
  'Home & Kitchen',
  'Health & Personal Care',
  'Groceries',
  'Other'
];

const AddPurchasePage = () => {
  const navigate = useNavigate();

  // Form Fields State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [seller, setSeller] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(formatInputDate(new Date()));
  const [returnDeadline, setReturnDeadline] = useState('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // File Upload State
  const [receiptFile, setReceiptFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Status State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Handle File Input Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Receipt file must be under 5MB.');
      return;
    }

    setReceiptFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setFilePreview(null);
  };

  // OCR Auto-populate callback
  const handleApplyOcr = ({ seller: ocrSeller, price: ocrPrice, purchaseDate: ocrDate }) => {
    if (ocrSeller && !seller) setSeller(ocrSeller);
    if (ocrPrice && !price) setPrice(ocrPrice);
    if (ocrDate) setPurchaseDate(ocrDate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic Validation
    if (!productName.trim()) {
      setFormError('Please enter a product name.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Price must be a valid positive number in Indian Rupees.');
      return;
    }

    if (!purchaseDate) {
      setFormError('Please select the date of purchase.');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('productName', productName.trim());
      formData.append('category', category);
      formData.append('price', parsedPrice);
      formData.append('seller', seller.trim());
      formData.append('purchaseDate', purchaseDate);
      if (returnDeadline) formData.append('returnDeadline', returnDeadline);
      if (warrantyEndDate) formData.append('warrantyEndDate', warrantyEndDate);
      if (notes) formData.append('notes', notes.trim());
      if (receiptFile) formData.append('receipt', receiptFile);

      const result = await createPurchase(formData);
      if (result.success) {
        navigate('/purchases');
      } else {
        setFormError(result.message || 'Failed to save purchase.');
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred while creating purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Back button & Title */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
        <Link
          to="/purchases"
          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Back to purchases"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Add New Purchase
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record item details, warranty expiration dates, and attach receipt files.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {formError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6"
      >
        {/* Section 1: Product Basics */}
        <div className="space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              1. Purchase Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. OnePlus 12 5G / LG Smart TV / Bosch Washing Machine"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price in INR */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Price (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="w-3.5 h-3.5 text-slate-500 font-bold absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="14999.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder-slate-400 tabular-nums"
                />
              </div>
            </div>

            {/* Seller / Store */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seller or Store Name
              </label>
              <div className="relative">
                <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Croma, Reliance Digital, Amazon.in"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Purchase Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Expiry & Deadlines */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              2. Deadlines & Warranty Tracking
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Return Deadline */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Return Deadline (Optional)
              </label>
              <input
                type="date"
                value={returnDeadline}
                onChange={(e) => setReturnDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
              />
              <span className="block text-[11px] text-slate-400 mt-1">
                Last day to return or exchange the product.
              </span>
            </div>

            {/* Warranty End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Warranty Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={warrantyEndDate}
                onChange={(e) => setWarrantyEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
              />
              <span className="block text-[11px] text-slate-400 mt-1">
                Manufacturer or extended warranty valid date.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Receipt Upload & Optional OCR */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              3. Receipt Document
            </h2>
          </div>

          <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-5 text-center transition-colors bg-slate-50/50">
            {!receiptFile ? (
              <label className="cursor-pointer block">
                <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Click to select receipt document
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Supports PNG, JPG, WEBP, SVG, or PDF up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml,.svg,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 text-left">
                <div className="flex items-center gap-3">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Thumbnail preview"
                      className="w-10 h-10 object-cover rounded-md border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-xs border border-slate-200">
                      PDF
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-xs">
                      {receiptFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(receiptFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Optional OCR Scanner */}
          {receiptFile && receiptFile.type.startsWith('image/') && (
            <OcrScanner file={receiptFile} onApply={handleApplyOcr} />
          )}
        </div>

        {/* Section 4: Notes */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            Notes & Serial Numbers (Optional)
          </label>
          <textarea
            rows="3"
            placeholder="Add serial number, invoice reference, or physical receipt filing location..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            to="/purchases"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving Purchase...
              </>
            ) : (
              'Save Purchase'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPurchasePage;
