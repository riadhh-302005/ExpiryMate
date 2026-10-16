// ============================================================================
// File: client/src/services/api.js
// 1. What this file does:
//    Sets up Axios to send network requests from our React frontend to our Node.js backend.
// 2. Why this file exists:
//    Instead of configuring the API URL and login cookies in every component,
//    we configure Axios once here and reuse it everywhere.
// 3. Important points to remember:
//    - withCredentials: true: Tells the browser to include our secure login cookie with every request.
//    - baseURL: Points to '/api' (or whatever URL is configured).
//    - Automatically formats server error messages so our UI components can show simple alerts.
// 4. How it connects to other parts:
//    - Used by 'authService.js', 'purchaseService.js', and 'dashboardService.js'.
// ============================================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Crucial for receiving and sending HTTP-only auth cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach token from localStorage if present as backup
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Extract clean error message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
