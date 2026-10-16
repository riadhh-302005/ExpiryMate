// ============================================================================
// File: client/src/services/dashboardService.js
// 1. What this file does:
//    Sends requests to the backend for dashboard data: spending totals, chart numbers,
//    upcoming deadlines, and the button to test email reminders.
// 2. Why this file exists:
//    Keeps all dashboard-related API calls in one neat file.
// 3. Important points to remember:
//    - getDashboardStats: Fetches summary metrics and chart figures for the dashboard.
//    - getUpcomingDeadlines: Fetches items with return or warranty deadlines coming up soon.
//    - triggerReminders: Manually triggers the reminder check from the Profile page.
// 4. How it connects to other parts:
//    - Uses 'services/api.js' to make the network calls.
//    - Called by 'DashboardPage.jsx', 'UpcomingDeadlinesPage.jsx', and 'ProfilePage.jsx'.
// ============================================================================

import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getUpcomingDeadlines = async () => {
  const response = await api.get('/dashboard/upcoming');
  return response.data;
};

export const triggerReminders = async () => {
  const response = await api.post('/dashboard/trigger-reminders');
  return response.data;
};
