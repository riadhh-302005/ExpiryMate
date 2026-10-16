// ============================================================================
// File: client/src/services/purchaseService.js
// 1. What this file does:
//    Sends requests to the backend for purchases: getting the list, getting one item,
//    adding a new item, editing an item, and deleting an item.
// 2. Why this file exists:
//    It packages up all purchase-related network calls so our React components
//    can call clean functions like `createPurchase(formData)`.
// 3. Important points to remember:
//    - Handles uploading files (FormData) when sending receipt images or PDFs.
//    - getPurchases: Passes your search text and filter choices to the backend.
//    - deletePurchase: Asks the backend to remove an item and delete its receipt.
// 4. How it connects to other parts:
//    - Uses 'services/api.js' to send the requests.
//    - Called by 'PurchasesPage.jsx', 'AddPurchasePage.jsx', and 'PurchaseDetailsPage.jsx'.
// ============================================================================

import api from './api';

export const getPurchases = async (params = {}) => {
  const response = await api.get('/purchases', { params });
  return response.data;
};

export const getPurchaseById = async (id) => {
  const response = await api.get(`/purchases/${id}`);
  return response.data;
};

export const createPurchase = async (formData) => {
  const response = await api.post('/purchases', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updatePurchase = async (id, formData) => {
  const response = await api.put(`/purchases/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deletePurchase = async (id) => {
  const response = await api.delete(`/purchases/${id}`);
  return response.data;
};
