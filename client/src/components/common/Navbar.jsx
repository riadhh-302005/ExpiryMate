// ============================================================================
// File: client/src/components/common/Navbar.jsx
// 1. What this file does:
//    Displays the top navigation bar with the ExpiryMate logo, mobile menu button,
//    your user profile name/avatar, and the logout button.
// 2. Why this file exists:
//    Gives users an easy way to see who is logged in and navigate from the top of any page.
// 3. Important points to remember:
//    - Shows user initials in a neat circular avatar.
//    - Clicking logout signs you out and redirects you to the login screen.
//    - On mobile phones, shows a menu button to open the sidebar drawer.
// 4. How it connects to other parts:
//    - Included at the top of 'App.jsx'.
//    - Uses 'context/AuthContext.jsx' to get the logged-in user and logout function.
// ============================================================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Menu, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 transition-colors">
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                  Expiry<span className="text-indigo-600">Mate</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  ₹ INR
                </span>
              </div>
            </Link>
          </div>

          {/* Right: User Menu & Session Controls */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-semibold text-xs flex items-center justify-center tracking-wide">
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {user.email}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden md:block group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out of your account"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
