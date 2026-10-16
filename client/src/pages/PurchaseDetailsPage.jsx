// ============================================================================
// File: client/src/pages/PurchaseDetailsPage.jsx
// 1. What this file does:
//    Shows the full details for a single purchase—including how many days
//    are left for the warranty or return window, the receipt photo/PDF, notes,
//    and buttons to edit or delete the item.
// 2. Why this file exists in the application:
//    Gives users an organized view of their purchase whenever they need to
//    show a receipt at a store or claim a warranty with customer service.
// 3. Important points to remember:
//    - Calculates remaining days in real time so the countdown is always accurate.
//    - Lets you preview the receipt in a high-resolution popup or download it.
//    - Uses a confirmation modal before deleting to avoid accidental mistakes.
// 4. How it connects to other parts of the application:
//    Opened at `/purchases/:id` and connects to `getPurchaseById()` in `purchaseService.js`.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Store,
  Tag,
  FileText,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { getPurchaseById, deletePurchase } from '../services/purchaseService';
import { formatCurrency } from '../utils/formatters';
import { formatDate, formatRelativeDays } from '../utils/dateUtils';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';
import ReceiptModal from '../components/common/ReceiptModal';

const PurchaseDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPurchaseById(id);
        if (res.success && res.data) {
          setPurchase(res.data);
        } else {
          setError('Purchase record not found.');
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve purchase details.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deletePurchase(id);
      navigate('/purchases');
    } catch (err) {
      alert(`Failed to delete purchase: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading purchase record..." />;
  }

  if (error || !purchase) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-slate-200 rounded-xl text-center shadow-xs">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900">Purchase Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">{error || 'This record does not exist or has been deleted.'}</p>
        <Link
          to="/purchases"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Purchases
        </Link>
      </div>
    );
  }

  const {
    productName,
    category,
    price,
    seller,
    purchaseDate,
    returnDeadline,
    warrantyEndDate,
    receiptUrl,
    receiptFileType,
    notes,
    warrantyStatus,
    returnStatus
  } = purchase;

  const isPdf = receiptFileType === 'pdf' || (receiptUrl && receiptUrl.toLowerCase().endsWith('.pdf'));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <Link
            to="/purchases"
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to catalogue"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge type="category" label={category} />
              <span className="text-xs text-slate-400">
                Purchased {formatDate(purchaseDate)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {productName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to={`/purchases/${id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            Delete
          </button>
        </div>
      </div>

      {/* Countdown Alert Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Warranty Status Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Warranty Expiry
              </span>
              <Badge
                type="warranty"
                status={warrantyStatus?.status}
                label={warrantyStatus?.label}
              />
            </div>
            <p className="mt-1.5 text-lg font-bold text-slate-900">
              {formatDate(warrantyEndDate)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {warrantyEndDate
                ? `Coverage ends ${formatRelativeDays(warrantyStatus?.daysRemaining)}`
                : 'No manufacturer warranty registered'}
            </p>
          </div>
        </div>

        {/* Return Deadline Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Return Deadline
              </span>
              <Badge
                type="return"
                status={returnStatus?.status}
                label={returnStatus?.label}
              />
            </div>
            <p className="mt-1.5 text-lg font-bold text-slate-900">
              {formatDate(returnDeadline)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {returnDeadline
                ? `Window closes ${formatRelativeDays(returnStatus?.daysRemaining)}`
                : 'No return policy deadline registered'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Details and Receipt Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Purchase Metadata */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Purchase Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Purchase Price
              </span>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(price)}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Seller / Store
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-slate-400" />
                {seller || 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Date of Purchase
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDate(purchaseDate)}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Product Category
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                {category}
              </p>
            </div>
          </div>

          {/* Notes Section */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
              Notes & Serial Info
            </span>
            {notes ? (
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg whitespace-pre-line leading-relaxed border border-slate-100">
                {notes}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No notes added.</p>
            )}
          </div>
        </div>

        {/* Right Column: Receipt Document Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Receipt Document
              </h2>
            </div>

            {receiptUrl ? (
              <div className="space-y-3">
                <div
                  onClick={() => setShowReceiptModal(true)}
                  className="cursor-pointer group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[160px]"
                >
                  {isPdf ? (
                    <div className="text-center p-6">
                      <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-700 block">PDF Receipt</span>
                      <span className="text-[10px] text-slate-400">Click to view document</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={receiptUrl}
                        alt="Receipt preview"
                        className="w-full h-40 object-cover group-hover:scale-102 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        Enlarge Receipt
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="flex-1 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-center border border-slate-200"
                  >
                    View Receipt
                  </button>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <FileText className="w-8 h-8 mx-auto stroke-1 mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-500">No receipt attached</p>
                <Link
                  to={`/purchases/${id}/edit`}
                  className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Attach receipt
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Purchase Record"
        message={`Are you sure you want to delete "${productName}"? All tracking information and receipt files will be permanently erased.`}
        confirmText="Yes, Delete"
        isLoading={deleting}
        onConfirm={handleDelete}
        onClose={() => setShowDeleteModal(false)}
      />

      {/* Full Receipt Preview Modal */}
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        receiptUrl={receiptUrl}
        productName={productName}
        fileType={receiptFileType}
      />
    </div>
  );
};

export default PurchaseDetailsPage;
