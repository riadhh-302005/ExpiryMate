// ============================================================================
// File: client/src/components/purchases/OcrScanner.jsx
// 1. What this file does:
//    Reads text from receipt photos using Tesseract.js. It tries to detect
//    the store name, purchase date, and total bill amount in Rupees (₹) so you
//    don't have to type them by hand.
// 2. Why this file exists in the application:
//    To save users time when adding new purchases by automatically filling in
//    the form details from their receipt image.
// 3. Important points to remember:
//    - Runs completely inside the browser (no external AI key or server needed).
//    - It only suggests the information; it never overwrites form fields until
//      you click the "Apply to Form Fields" button.
//    - You can always review and edit the detected values before saving.
// 4. How it connects to other parts of the application:
//    Used inside AddPurchasePage.jsx right below the receipt image file picker.
// ============================================================================

import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const OcrScanner = ({ file, onApply }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);

  // Simple heuristic parser for English receipt text
  const parseReceiptText = (rawText) => {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let price = '';
    let seller = '';
    let date = '';

    // 1. Detect Seller: typically in first 3 non-empty lines
    if (lines.length > 0) {
      const candidate = lines.slice(0, 3).find((l) => !/^\d+$/.test(l) && l.length > 2);
      if (candidate) seller = candidate.replace(/[^\w\s&'-]/gi, '').trim();
    }

    // 2. Detect Total Price: look for 'total', 'amount', '₹', 'Rs', 'INR', '$'
    const priceRegex = /(?:total|amount|due|balance|net)?\s*(?:₹|rs\.?|inr|[\$£€])?\s*([0-9]+\.[0-9]{2}|[0-9]+)\b/i;
    for (let i = lines.length - 1; i >= 0; i--) {
      const match = lines[i].match(priceRegex);
      if (match && match[1]) {
        price = match[1];
        break;
      }
    }

    // Fallback price scan if not found
    if (!price) {
      const fallbackMatches = rawText.match(/\b\d+\.\d{2}\b/g);
      if (fallbackMatches && fallbackMatches.length) {
        const numbers = fallbackMatches.map(Number);
        price = String(Math.max(...numbers));
      }
    }

    // 3. Detect Date (MM/DD/YYYY, YYYY-MM-DD, or DD/MM/YYYY)
    const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/;
    const dateMatch = rawText.match(dateRegex);
    if (dateMatch) {
      const rawDate = new Date(dateMatch[1]);
      if (!isNaN(rawDate.getTime())) {
        const y = rawDate.getFullYear();
        const m = String(rawDate.getMonth() + 1).padStart(2, '0');
        const d = String(rawDate.getDate()).padStart(2, '0');
        date = `${y}-${m}-${d}`;
      }
    }

    return { seller, price, date, rawText };
  };

  const handleScan = async () => {
    if (!file) return;

    // Check if file is an image (Tesseract cannot parse raw PDFs in browser)
    if (file.type === 'application/pdf') {
      setError('OCR text recognition is only supported for image receipts (PNG, JPG, WEBP).');
      return;
    }

    try {
      setScanning(true);
      setError(null);
      setExtractedData(null);
      setProgress(0);

      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      const parsed = parseReceiptText(result.data.text);
      setExtractedData(parsed);
    } catch (err) {
      console.error('[OCR Error]', err);
      setError('Could not extract text from this receipt. You can still fill fields manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmApply = () => {
    if (extractedData) {
      onApply({
        seller: extractedData.seller || '',
        price: extractedData.price || '',
        purchaseDate: extractedData.date || ''
      });
      setExtractedData(null);
    }
  };

  if (!file || file.type === 'application/pdf') return null;

  return (
    <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-semibold text-slate-900">
            Auto-Extract Receipt Details (OCR)
          </span>
        </div>
        {!scanning && !extractedData && (
          <button
            type="button"
            onClick={handleScan}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            Scan Receipt
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      {scanning && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Scanning receipt text...
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-rose-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Extracted Details Confirmation Banner */}
      {extractedData && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs">
          <p className="font-semibold text-slate-900">
            Detected details (review before applying):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-semibold">Store</span>
              <span className="font-semibold text-slate-800 truncate block">
                {extractedData.seller || 'Not detected'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-semibold">Total Price</span>
              <span className="font-semibold text-slate-800 tabular-nums block">
                {extractedData.price ? `₹${extractedData.price}` : 'Not detected'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] uppercase font-semibold">Date</span>
              <span className="font-semibold text-slate-800 block">
                {extractedData.date || 'Not detected'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setExtractedData(null)}
              className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded-md text-xs font-semibold transition-colors"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleConfirmApply}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Apply to Form Fields
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OcrScanner;
