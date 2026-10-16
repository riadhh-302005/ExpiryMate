// ============================================================================
// File: client/src/services/authService.js
// 1. What this file does:
//    Sends account requests to the backend (registering, logging in, logging out,
//    and fetching the current user's profile).
// 2. Why this file exists:
//    Keeps the HTTP request code clean and in one place, so our React pages
//    don't have to write raw Axios calls.
// 3. Important points to remember:
//    - registerUser: Sends user name, email, and password to POST /auth/register.
//    - loginUser: Sends credentials to POST /auth/login.
//    - logoutUser: Tells the backend to clear the login cookie.
//    - getCurrentUser: Checks if you are already logged in when you open the site.
// 4. How it connects to other parts:
//    - Uses 'services/api.js' to send the requests.
//    - Called by 'context/AuthContext.jsx'.
// ============================================================================

import api from './api';

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
