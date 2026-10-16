// ============================================================================
// File: client/src/components/common/ConfirmModal.jsx
// 1. What this file does:
//    Pops up a confirmation dialog asking "Are you sure?" before deleting a purchase.
// 2. Why this file exists:
//    Prevents users from accidentally deleting their receipts with an accidental click.
// 3. Important points to remember:
//    - isOpen: Controls if the popup is visible on screen.
//    - onConfirm: Function that actually deletes the item if the user clicks "Yes".
//    - onClose: Cancels and closes the popup without doing anything.
// 4. How it connects to other parts:
//    - Triggered by delete buttons on 'PurchasesPage.jsx' and 'PurchaseDetailsPage.jsx'.
// ============================================================================

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden p-6 transform transition-all">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
              isDanger
                ? 'bg-rose-50 border border-rose-200 text-rose-600'
                : 'bg-slate-100 border border-slate-200 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50 shadow-xs ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
