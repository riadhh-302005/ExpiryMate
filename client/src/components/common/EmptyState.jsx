// ============================================================================
// File: client/src/components/common/EmptyState.jsx
// 1. What this file does:
//    Shows a friendly message and icon when there is nothing to display
//    (for example, when a user has no purchases yet or a search finds 0 results).
// 2. Why this file exists:
//    Prevents an empty blank screen and guides the user on what to do next
//    (like showing an "Add First Purchase" button).
// 3. Important points to remember:
//    - icon: The icon to show in the center.
//    - title & description: Explains why the list is currently empty.
//    - actionText & onAction: An optional button the user can click to fix it.
// 4. How it connects to other parts:
//    - Used by 'PurchasesPage.jsx' and 'DashboardPage.jsx'.
// ============================================================================

import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'You have not added any purchases matching this criteria.',
  actionText,
  onAction
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-md mx-auto my-6 shadow-xs">
      <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mx-auto mb-3.5 border border-slate-200">
        <Icon className="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
