// ============================================================================
// File: client/src/pages/UpcomingDeadlinesPage.jsx
// 1. What this file does:
//    Focuses specifically on upcoming deadlines, organized into two clear sections:
//    "Return Windows Closing Soon" and "Warranties Expiring Soon".
// 2. Why this file exists in the application:
//    To make sure users never miss an exchange deadline or lose out on warranty
//    service before it's too late.
// 3. Important points to remember:
//    - Return deadlines are flagged if they expire within 14 days.
//    - Warranties are flagged if they expire within 60 days.
//    - Sorted by the closest deadline first, with color-coded badges for easy reading.
// 4. How it connects to other parts of the application:
//    Accessible from the sidebar at `/deadlines` and calls `getUpcomingDeadlines()`.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  ShieldAlert,
  ArrowRight,
  Store,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { getUpcomingDeadlines } from '../services/dashboardService';
import { formatCurrency } from '../utils/formatters';
import { formatDate } from '../utils/dateUtils';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UpcomingDeadlinesPage = () => {
  const [deadlines, setDeadlines] = useState({ returnDeadlines: [], warrantyExpirations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUpcomingDeadlines();
      if (res.success && res.data) {
        setDeadlines(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load upcoming deadlines.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Checking upcoming deadlines..." />;
  }

  const { returnDeadlines = [], warrantyExpirations = [] } = deadlines;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Title */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Upcoming Critical Deadlines
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Urgent return windows closing within 14 days and manufacturer warranties expiring within 60 days.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Return Windows Closing Soon */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Return Deadlines Closing Soon
            </h2>
            <p className="text-xs text-slate-500">
              Initiate exchanges or refunds before the return policy window closes.
            </p>
          </div>
        </div>

        {returnDeadlines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {returnDeadlines.map((p) => (
              <div
                key={p._id}
                className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs hover:border-amber-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {p.category}
                    </span>
                    <Badge
                      type="return"
                      status={p.returnStatus?.status}
                      days={p.returnStatus?.daysRemaining}
                    />
                  </div>

                  <Link
                    to={`/purchases/${p._id}`}
                    className="font-semibold text-slate-900 text-base hover:text-indigo-600 transition-colors block line-clamp-1"
                  >
                    {p.productName}
                  </Link>

                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-3">
                    <span className="font-bold text-slate-800 tabular-nums">
                      {formatCurrency(p.price)}
                    </span>
                    {p.seller && (
                      <span className="flex items-center gap-1 truncate">
                        <Store className="w-3 h-3 text-slate-400" />
                        {p.seller}
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-amber-800 font-semibold">
                    Cut-off: {formatDate(p.returnDeadline)}
                  </span>
                  <Link
                    to={`/purchases/${p._id}`}
                    className="font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                  >
                    View details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              No Urgent Return Deadlines
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You have no pending return windows expiring within the next 14 days.
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Warranties Expiring Soon */}
      <div className="space-y-4 pt-4 border-t border-slate-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Warranties Expiring Soon
            </h2>
            <p className="text-xs text-slate-500">
              Submit repair or replacement claims before manufacturer coverage expires.
            </p>
          </div>
        </div>

        {warrantyExpirations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warrantyExpirations.map((p) => (
              <div
                key={p._id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {p.category}
                    </span>
                    <Badge
                      type="warranty"
                      status={p.warrantyStatus?.status}
                      days={p.warrantyStatus?.daysRemaining}
                    />
                  </div>

                  <Link
                    to={`/purchases/${p._id}`}
                    className="font-semibold text-slate-900 text-base hover:text-indigo-600 transition-colors block line-clamp-1"
                  >
                    {p.productName}
                  </Link>

                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-3">
                    <span className="font-bold text-slate-800 tabular-nums">
                      {formatCurrency(p.price)}
                    </span>
                    {p.seller && (
                      <span className="flex items-center gap-1 truncate">
                        <Store className="w-3 h-3 text-slate-400" />
                        {p.seller}
                      </span>
                    )}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold">
                    Expires: {formatDate(p.warrantyEndDate)}
                  </span>
                  <Link
                    to={`/purchases/${p._id}`}
                    className="font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                  >
                    View details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              No Warranties Expiring Soon
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              All tracked manufacturer warranties have ample time remaining.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingDeadlinesPage;
