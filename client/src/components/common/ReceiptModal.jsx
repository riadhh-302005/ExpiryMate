// ============================================================================
// File: client/src/components/common/ReceiptModal.jsx
// 1. What this file does:
//    Opens a full-screen preview popup to view a receipt photo or download a PDF invoice.
// 2. Why this file exists:
//    Lets users quickly inspect their bills and warranty receipts without leaving the page.
// 3. Important points to remember:
//    - Handles both image files (JPG, PNG) and PDF documents.
//    - Includes an "Open original" button to view the file full-size in a new browser tab.
// 4. How it connects to other parts:
//    - Opened when clicking "View Receipt" on 'PurchaseCard.jsx' or 'DashboardPage.jsx'.
// ============================================================================

import React from 'react';
import { X, ExternalLink, Download, FileText, Image as ImageIcon } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, receiptUrl, productName, fileType = 'image' }) => {
  if (!isOpen) return null;

  const isPdf = fileType === 'pdf' || (receiptUrl && receiptUrl.toLowerCase().endsWith('.pdf'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            {isPdf ? (
              <FileText className="w-4 h-4 text-slate-700" />
            ) : (
              <ImageIcon className="w-4 h-4 text-slate-700" />
            )}
            <h3 className="font-semibold text-xs sm:text-sm text-slate-900 truncate max-w-md">
              Receipt: {productName || 'Purchase Document'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {receiptUrl && (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open original
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-auto flex items-center justify-center bg-slate-50 min-h-[300px]">
          {!receiptUrl ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
              <p className="text-xs font-medium text-slate-500">No receipt file attached to this purchase.</p>
            </div>
          ) : isPdf ? (
            <div className="w-full text-center py-12">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-800 font-semibold text-sm mb-1">PDF Receipt Document</p>
              <p className="text-slate-500 text-xs mb-4">Click below to open or download the complete PDF invoice.</p>
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                View & Download PDF
              </a>
            </div>
          ) : (
            <img
              src={receiptUrl}
              alt={`Receipt for ${productName}`}
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-xs border border-slate-200 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
