// ============================================================================
// File: client/src/components/purchases/PurchaseFilters.jsx
// 1. What this file does:
//    Displays the search bar, category dropdown, warranty filter, and sorting options
//    so users can easily find specific receipts.
// 2. Why this file exists:
//    Keeps the filter and search controls in one reusable toolbar above the purchase list.
// 3. Important points to remember:
//    - Real-time search: Filters items as you type product or store names.
//    - Filter by category (Electronics, Appliances, etc.) or warranty status (Active, Expired).
//    - "Reset Filters" button: Clears everything back to default in one click.
// 4. How it connects to other parts:
//    - Embedded at the top of 'PurchasesPage.jsx'.
// ============================================================================

import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Appliances',
  'Furniture',
  'Clothing',
  'Home & Kitchen',
  'Health & Personal Care',
  'Groceries',
  'Other'
];

const PurchaseFilters = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by product name or seller (e.g. Croma, Samsung, Sony)..."
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Category */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Warranty Status */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Warranty
          </label>
          <select
            value={filters.warrantyStatus}
            onChange={(e) => onChange('warrantyStatus', e.target.value)}
            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          >
            <option value="All">All Warranties</option>
            <option value="active">Active Only</option>
            <option value="expiring_soon">Expiring Soon (≤30d)</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Sort Property */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          >
            <option value="purchaseDate">Purchase Date</option>
            <option value="price">Price (₹)</option>
            <option value="warrantyEndDate">Warranty Expiry</option>
            <option value="returnDeadline">Return Deadline</option>
          </select>
        </div>

        {/* Sort Direction */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Order
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => onChange('sortOrder', e.target.value)}
            className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Reset Action */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseFilters;
