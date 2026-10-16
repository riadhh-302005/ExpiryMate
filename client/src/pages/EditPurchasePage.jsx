// ============================================================================
// File: client/src/pages/EditPurchasePage.jsx
// 1. What this file does:
//    Loads an existing purchase by its ID, fills out the form with its current
//    details, and lets the user update any information or replace the receipt.
// 2. Why this file exists in the application:
//    So users can easily fix typos, update warranty dates, or upload a better
//    receipt photo later on.
// 3. Important points to remember:
//    - Automatically fetches the existing purchase data when the page loads.
//    - If you don't pick a new receipt file, it keeps your existing receipt safe.
//    - Sends changes using HTTP PUT with `FormData` to handle possible file updates.
// 4. How it connects to other parts of the application:
//    Opened at `/purchases/:id/edit` and calls `updatePurchase()` in `purchaseService.js`.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Calendar,
  Store,
  Tag,
  Loader2,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { getPurchaseById, updatePurchase } from '../services/purchaseService';
import { formatInputDate } from '../utils/dateUtils';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

const EditPurchasePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form Fields State
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [seller, setSeller] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [returnDeadline, setReturnDeadline] = useState('');
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Existing receipt metadata
  const [existingReceiptUrl, setExistingReceiptUrl] = useState('');
  const [existingReceiptType, setExistingReceiptType] = useState('none');

  // New file replacement state
  const [newFile, setNewFile] = useState(null);
  const [newFilePreview, setNewFilePreview] = useState(null);

  // Status State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial purchase details
  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPurchaseById(id);
        if (res.success && res.data) {
          const item = res.data;
          setProductName(item.productName || '');
          setCategory(item.category || 'Other');
          setPrice(String(item.price ?? ''));
          setSeller(item.seller || '');
          setPurchaseDate(formatInputDate(item.purchaseDate));
          setReturnDeadline(formatInputDate(item.returnDeadline));
          setWarrantyEndDate(formatInputDate(item.warrantyEndDate));
          setNotes(item.notes || '');
          setExistingReceiptUrl(item.receiptUrl || '');
          setExistingReceiptType(item.receiptFileType || 'none');
        }
      } catch (err) {
        setError(err.message || 'Failed to load purchase details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Replacement receipt file must be under 5MB.');
      return;
    }

    setNewFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setNewFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setNewFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!productName.trim()) {
      setError('Product name cannot be empty.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid positive number in Indian Rupees.');
      return;
    }

    if (!purchaseDate) {
      setError('Purchase date is required.');
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
      formData.append('returnDeadline', returnDeadline || '');
      formData.append('warrantyEndDate', warrantyEndDate || '');
      formData.append('notes', notes.trim());

      // Append replacement file if selected
      if (newFile) {
        formData.append('receipt', newFile);
      }

      const res = await updatePurchase(id, formData);
      if (res.success) {
        navigate(`/purchases/${id}`);
      } else {
        setError(res.message || 'Failed to update purchase.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading purchase record..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/60">
        <Link
          to={`/purchases/${id}`}
          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Back to purchase details"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Edit Purchase Details
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify product information, update expiration dates, or replace receipts.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

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
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
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
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Seller or Store Name
              </label>
              <div className="relative">
                <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
                />
              </div>
            </div>

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

        {/* Section 2: Deadlines */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              2. Deadlines & Warranty Tracking
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

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
            </div>
          </div>
        </div>

        {/* Section 3: Receipt Document Replacement */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              3. Receipt Document
            </h2>
          </div>

          {/* Current Receipt Stored */}
          {existingReceiptUrl && !newFile && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800">Current Receipt Attached</p>
                  <a
                    href={existingReceiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:underline"
                  >
                    View existing receipt document
                  </a>
                </div>
              </div>
              <span className="text-[11px] text-slate-400">Upload below to replace</span>
            </div>
          )}

          {/* Upload Replacement Box */}
          <div className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-5 text-center transition-colors bg-slate-50/50">
            {!newFile ? (
              <label className="cursor-pointer block">
                <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Click to replace current receipt
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Supports PNG, JPG, WEBP, SVG, PDF up to 5MB
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
                  {newFilePreview ? (
                    <img
                      src={newFilePreview}
                      alt="New preview"
                      className="w-10 h-10 object-cover rounded-md border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center font-bold text-xs border border-slate-200">
                      PDF
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-xs">
                      {newFile.name} (Replacement)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(newFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewFile(null);
                    setNewFilePreview(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700">
            Notes & Serial Numbers
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-slate-900"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Link
            to={`/purchases/${id}`}
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
                Saving Changes...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPurchasePage;
