// ============================================================================
// File: client/src/pages/PurchasesPage.jsx
// 1. What this file does:
//    Shows the full list of all your saved purchases. You can search by product
//    or store name, filter by category or warranty status, and sort by date or price.
// 2. Why this file exists in the application:
//    Acts as the main digital filing cabinet where users can easily browse,
//    find, and manage all their receipts.
// 3. Important points to remember:
//    - Re-fetches the list from the backend whenever you type in search or change a filter.
//    - Lets you open receipts in a modal popup or click to view full details.
//    - Asks for confirmation before deleting any purchase so you don't delete by mistake.
// 4. How it connects to other parts of the application:
//    Opened at `/purchases`, and links to `/purchases/new` to add items or
//    `/purchases/:id` to view details.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Receipt, RefreshCw, AlertCircle } from 'lucide-react';
import { getPurchases, deletePurchase } from '../services/purchaseService';
import PurchaseCard from '../components/purchases/PurchaseCard';
import PurchaseFilters from '../components/purchases/PurchaseFilters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import ReceiptModal from '../components/common/ReceiptModal';

const initialFilters = {
  search: '',
  category: 'All',
  warrantyStatus: 'All',
  sortBy: 'purchaseDate',
  sortOrder: 'desc'
};

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Receipt preview modal state
  const [receiptModal, setReceiptModal] = useState({
    isOpen: false,
    url: '',
    title: '',
    fileType: 'image'
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPurchases(filters);
      if (res.success) {
        setPurchases(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch purchases.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search / filter reload
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchItems();
    }, 250);

    return () => clearTimeout(handler);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Receipt preview handler
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

  // Delete confirmation handlers
  const handleOpenDelete = (purchase) => {
    setDeleteTarget(purchase);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deletePurchase(deleteTarget._id);
      setPurchases((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      alert(`Could not delete purchase: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              All Tracked Purchases
            </h1>
            {!loading && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {purchases.length} record{purchases.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Search, filter, and review warranty documents and purchase receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={fetchItems}
            title="Refresh list"
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/purchases/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Purchase
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <PurchaseFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error alert */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading or Purchases Grid */}
      {loading ? (
        <LoadingSpinner message="Searching purchases..." />
      ) : purchases.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchases.map((purchase) => (
            <PurchaseCard
              key={purchase._id}
              purchase={purchase}
              onPreviewReceipt={handleOpenReceipt}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="No purchases found"
          description={
            filters.search || filters.category !== 'All' || filters.warrantyStatus !== 'All'
              ? 'Try modifying your search query or reset your filters.'
              : 'Start by tracking your first receipt and warranty deadline.'
          }
          actionText={
            filters.search || filters.category !== 'All' || filters.warrantyStatus !== 'All'
              ? 'Reset Filters'
              : 'Add First Purchase'
          }
          onAction={
            filters.search || filters.category !== 'All' || filters.warrantyStatus !== 'All'
              ? handleResetFilters
              : () => (window.location.href = '/purchases/new')
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Purchase"
        message={`Are you sure you want to permanently delete "${deleteTarget?.productName}"? Any associated receipt file will also be removed from storage.`}
        confirmText="Yes, Delete"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Receipt Preview Modal */}
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

export default PurchasesPage;
