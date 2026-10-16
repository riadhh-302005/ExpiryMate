// ============================================================================
// File: client/src/components/common/StatCard.jsx
// 1. What this file does:
//    Displays a single summary box on the dashboard (like Total Spending,
//    Tracked Items, or Active Warranties).
// 2. Why this file exists:
//    It gives a clean, reusable design for key statistics so all dashboard cards
//    look uniform, balanced, and easy to read.
// 3. Important points to remember:
//    - Shows a title, the big bold number (or price in ₹), and an optional helper note.
//    - Uses number alignment (tabular-nums) so numbers never jitter.
//    - Keeps cards calm and professional without distracting bright colors.
// 4. How it connects to other parts:
//    - Rendered in a grid on 'DashboardPage.jsx'.
// ============================================================================

import React from 'react';

const StatCard = ({
  icon: Icon,
  title,
  value,
  helper,
  badgeText,
  badgeVariant = 'neutral'
}) => {
  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'danger':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 stroke-[2]" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </span>
          {badgeText && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getBadgeStyle()}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>

      {helper && (
        <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          {helper}
        </p>
      )}
    </div>
  );
};

export default StatCard;
