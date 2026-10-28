// ============================================================================
// File: client/src/pages/DashboardPage.jsx
// 1. What this file does:
//    The main home screen after logging in. It shows total spending in Rupees (₹),
//    active warranties, urgent return deadlines, spending charts, and the
//    latest purchases.
// 2. Why this file exists in the application:
//    To give users a complete snapshot of their purchases and upcoming deadlines
//    in one convenient place so they never miss a return or warranty claim.
// 3. Important points to remember:
//    - Fetches live statistics from the backend when the page loads.
//    - Shows an urgent warning banner if any return window expires within 14 days.
//    - Contains interactive charts and lets you view receipts right away in a popup.
// 4. How it connects to other parts of the application:
//    The default home route (`/`) when logged in. Links to all other pages like
//    Add Purchase, All Purchases, and Upcoming Deadlines.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  Clock,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  AlertCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { getDashboardStats } from '../services/dashboardService';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CategorySpendingChart from '../components/charts/CategorySpendingChart';
import MonthlySpendingChart from '../components/charts/MonthlySpendingChart';
import PurchaseCard from '../components/purchases/PurchaseCard';
import ReceiptModal from '../components/common/ReceiptModal';
import { formatCurrency } from '../utils/formatters';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState({
    isOpen: false,
    url: '',
    title: '',
    fileType: 'image'
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenReceipt = (url, title, fileType) => {
    setReceiptModal({
      isOpen: true,
      url,
      title,
      fileType: fileType || 'image'
    });
  };

  const handleCloseReceipt = () => {
    setReceiptModal({
      isOpen: false,
      url: '',
      title: '',
      fileType: 'image'
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard analytics..." />;
  }

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto my-8 bg-white border border-rose-200 rounded-xl text-center shadow-xs">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-900 text-base">Unable to load dashboard</h3>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const categorySpending = data?.categorySpending || [];
  const monthlySpending = data?.monthlySpending || [];
  const recentPurchases = data?.recentPurchases || [];
  const summary = data?.summary || {
    totalSpending: data?.totalSpending ?? data?.totalSpend ?? 0,
    totalItems: data?.totalItems ?? data?.totalPurchases ?? recentPurchases.length,
    activeWarranties: data?.activeWarranties ?? 0,
    upcomingReturns: data?.upcomingReturns ?? data?.upcomingReturnsCount ?? 0,
    expiringWarranties: data?.expiringWarranties ?? data?.expiringSoonCount ?? 0
  };
  const hasUrgentDeadlines = (summary?.upcomingReturns > 0) || (summary?.expiringWarranties > 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Title & Main Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Purchase & Warranty Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Real-time tracking of purchase expenses, active warranties, and return windows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link
            to="/deadlines"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Check Deadlines
          </Link>
          <Link
            to="/purchases/new"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Purchase
          </Link>
        </div>
      </div>

      {/* Prominent Urgent Deadlines Callout Banner */}
      {hasUrgentDeadlines && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-amber-950">
                Action Required: Approaching Deadlines
              </p>
              <p className="text-xs text-amber-800/90 mt-0.5">
                {summary.upcomingReturns > 0 && (
                  <span className="font-semibold text-amber-900">
                    {summary.upcomingReturns} return window{summary.upcomingReturns > 1 ? 's' : ''} closing within 7 days.{' '}
                  </span>
                )}
                {summary.expiringWarranties > 0 && (
                  <span>
                    {summary.expiringWarranties} manufacturer warrant{summary.expiringWarranties > 1 ? 'ies' : 'y'} expiring within 30 days.
                  </span>
                )}
              </p>
            </div>
          </div>

          <Link
            to="/deadlines"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0 self-start sm:self-auto"
          >
            Review Deadlines
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* High-Level Metric Cards Grid (Balanced 4-Card Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={IndianRupee}
          title="Total Spending"
          value={formatCurrency(summary?.totalSpending || 0)}
          helper="All tracked receipts in ₹ INR"
        />

        <StatCard
          icon={Receipt}
          title="Tracked Items"
          value={summary?.totalPurchases || 0}
          helper="Total registered purchase records"
        />

        <StatCard
          icon={ShieldCheck}
          title="Active Warranties"
          value={summary?.activeWarranties || 0}
          helper="Products currently under coverage"
        />

        <StatCard
          icon={Clock}
          title="Upcoming Deadlines"
          value={(summary?.upcomingReturns || 0) + (summary?.expiringWarranties || 0)}
          helper="Return windows & expiring warranties"
          badgeText={
            (summary?.upcomingReturns || 0) + (summary?.expiringWarranties || 0) > 0
              ? 'Attention'
              : 'Clear'
          }
          badgeVariant={
            (summary?.upcomingReturns || 0) + (summary?.expiringWarranties || 0) > 0
              ? 'warning'
              : 'neutral'
          }
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Spending History */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-700" />
              <h2 className="font-semibold text-slate-900 text-sm">Monthly Expenses</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Last 6 Months</span>
          </div>
          <MonthlySpendingChart data={monthlySpending} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-700" />
              <h2 className="font-semibold text-slate-900 text-sm">Spending by Category</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">All Time</span>
          </div>
          <CategorySpendingChart data={categorySpending} />
        </div>
      </div>

      {/* Recently Added Purchases Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-semibold text-slate-900 text-base">Recently Added Purchases</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest registered items and receipts</p>
          </div>
          <Link
            to="/purchases"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View all purchases
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPurchases && recentPurchases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase._id}
                purchase={purchase}
                onPreviewReceipt={handleOpenReceipt}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
            <Receipt className="w-8 h-8 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-600">No purchases recorded yet</p>
            <Link
              to="/purchases/new"
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add your first purchase
            </Link>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={handleCloseReceipt}
        receiptUrl={receiptModal.url}
        productName={receiptModal.title}
        fileType={receiptModal.fileType}
      />
    </div>
  );
};

export default DashboardPage;
