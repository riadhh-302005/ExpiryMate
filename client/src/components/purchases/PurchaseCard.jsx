// ============================================================================
// File: client/src/components/purchases/PurchaseCard.jsx
// 1. What this file does:
//    Displays one purchase as a neat card with product name, store, price in ₹,
//    purchase date, countdown badges, and quick buttons to view receipt or edit.
// 2. Why this file exists:
//    It is the main card used to show items in lists on both the Dashboard and Purchases page.
// 3. Important points to remember:
//    - Highlights approaching return deadlines with a subtle amber border so you notice them.
//    - Clicking "Receipt" opens the full receipt preview.
//    - Formats all prices cleanly in Indian Rupees (₹).
// 4. How it connects to other parts:
//    - Used by 'DashboardPage.jsx' and 'PurchasesPage.jsx'.
// ============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Store,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';

const PurchaseCard = ({ purchase, onPreviewReceipt, onDelete }) => {
  const {
    _id,
    productName,
    category,
    price,
    seller,
    purchaseDate,
    returnDeadline,
    warrantyEndDate,
    receiptUrl,
    receiptFileType,
    warrantyStatus,
    returnStatus
  } = purchase;

  // Determine if this item has an imminent deadline requiring attention
  const isReturnUrgent = returnStatus?.status === 'approaching';
  const isWarrantyUrgent = warrantyStatus?.status === 'expiring_soon';

  return (
    <div
      className={`bg-white rounded-xl border ${
        isReturnUrgent
          ? 'border-amber-300 ring-1 ring-amber-200'
          : 'border-slate-200'
      } p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between group`}
    >
      <div>
        {/* Top Header: Category & Action icons */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge type="category" label={category} />

          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              to={`/purchases/${_id}`}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              title="View full details"
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>
            <Link
              to={`/purchases/${_id}/edit`}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
              title="Edit purchase"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(purchase)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                title="Delete purchase"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Product Title & Price */}
        <Link to={`/purchases/${_id}`} className="block">
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2 hover:text-indigo-600 transition-colors">
            {productName}
          </h3>
        </Link>
        <p className="mt-1.5 text-xl font-bold text-slate-900 tracking-tight tabular-nums">
          {formatCurrency(price)}
        </p>

        {/* Urgent Alert Banner (if deadline approaching) */}
        {isReturnUrgent && (
          <div className="mt-2.5 px-2.5 py-1.5 rounded-md bg-amber-50 border border-amber-200 flex items-center gap-1.5 text-xs text-amber-800">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="font-medium">
              Return window closing in {returnStatus?.daysRemaining}d
            </span>
          </div>
        )}

        {/* Metadata: Seller and Purchase Date */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
          {seller && (
            <div className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{seller}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Purchased {formatDate(purchaseDate)}</span>
          </div>
        </div>

        {/* Dynamic Countdown Badges */}
        {(warrantyEndDate || returnDeadline) && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            {warrantyEndDate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Warranty</span>
                <Badge
                  type="warranty"
                  status={warrantyStatus?.status}
                  label={warrantyStatus?.label}
                  days={warrantyStatus?.daysRemaining}
                />
              </div>
            )}

            {returnDeadline && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Return Window</span>
                <Badge
                  type="return"
                  status={returnStatus?.status}
                  label={returnStatus?.label}
                  days={returnStatus?.daysRemaining}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer: Receipt Preview Trigger and Details Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        {receiptUrl ? (
          <button
            type="button"
            onClick={() => onPreviewReceipt(receiptUrl, productName, receiptFileType)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Receipt
          </button>
        ) : (
          <span className="text-xs text-slate-400 italic">No receipt file</span>
        )}

        <Link
          to={`/purchases/${_id}`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
        >
          Details
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </div>
  );
};

export default PurchaseCard;
