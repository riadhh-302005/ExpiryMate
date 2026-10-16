// ============================================================================
// File: client/src/components/common/Badge.jsx
// 1. What this file does:
//    Displays small, colorful status tags (like "Active", "Expiring Soon", "Expired",
//    or category tags like "Electronics").
// 2. Why this file exists:
//    Reusing one Badge component keeps all status labels and colors consistent across every screen.
// 3. Important points to remember:
//    - Shows a small colored dot (green for active, orange for ending soon, gray for expired).
//    - Automatically formats the days remaining text (e.g. "3d left").
// 4. How it connects to other parts:
//    - Used inside purchase cards, detail pages, and deadline lists.
// ============================================================================

import React from 'react';

const Badge = ({ type = 'warranty', status = 'not_set', label, days }) => {
  // 1. Warranty status badges
  if (type === 'warranty') {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {label || (days !== undefined && days !== null ? `Warranty active (${days}d)` : 'Warranty active')}
          </span>
        );
      case 'expiring_soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {label || (days !== undefined && days !== null ? `Expiring soon (${days}d)` : 'Expiring soon')}
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {label || 'Warranty expired'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            {label || 'No warranty'}
          </span>
        );
    }
  }

  // 2. Return window status badges
  if (type === 'return') {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {label || (days !== undefined && days !== null ? `Return open (${days}d)` : 'Return open')}
          </span>
        );
      case 'approaching':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {label || (days !== undefined && days !== null ? `Return soon (${days}d)` : 'Return soon')}
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {label || 'Return closed'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-400 border border-slate-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            {label || 'No return policy'}
          </span>
        );
    }
  }

  // 3. Category badges
  if (type === 'category') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
      {label}
    </span>
  );
};

export default Badge;
