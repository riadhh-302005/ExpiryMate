// ============================================================================
// File: client/src/App.jsx
// 1. What this file does:
//    Sets up page navigation (routing) for the website, decides which pages require
//    login, and puts the top Navbar and Sidebar around private pages.
// 2. Why this file exists:
//    It acts as the traffic controller for the entire frontend, deciding which
//    screen to show based on the browser URL.
// 3. Important points to remember:
//    - ProtectedRoute: Checks if the user is logged in. If not, sends them to /login.
//    - PublicRoute: If a user is already logged in, redirects them away from /login to the dashboard.
//    - Wraps everything in <AuthProvider> so all components know who is logged in.
// 4. How it connects to other parts:
//    - Loaded by 'main.jsx'.
//    - Loads all pages from 'pages/' and shared bars from 'components/common/'.
// ============================================================================

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Navigation Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PurchasesPage from './pages/PurchasesPage';
import AddPurchasePage from './pages/AddPurchasePage';
import EditPurchasePage from './pages/EditPurchasePage';
import PurchaseDetailsPage from './pages/PurchaseDetailsPage';
import UpcomingDeadlinesPage from './pages/UpcomingDeadlinesPage';
import ProfilePage from './pages/ProfilePage';

// Authenticated Route Guard Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner fullPage={true} message="Restoring session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

// Public Route Guard (Redirects away from /login and /register if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage={true} message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <PurchasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/new"
            element={
              <ProtectedRoute>
                <AddPurchasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/:id"
            element={
              <ProtectedRoute>
                <PurchaseDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases/:id/edit"
            element={
              <ProtectedRoute>
                <EditPurchasePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deadlines"
            element={
              <ProtectedRoute>
                <UpcomingDeadlinesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
