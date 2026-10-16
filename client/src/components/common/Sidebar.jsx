// ============================================================================
// File: client/src/components/common/Sidebar.jsx
// 1. What this file does:
//    Displays the side navigation menu with links to Dashboard, All Purchases,
//    Add Purchase, Upcoming Deadlines, and Profile.
// 2. Why this file exists:
//    Allows users to quickly jump between different screens in the app with one click.
// 3. Important points to remember:
//    - navItems: The list of links with their labels, paths, and icons.
//    - Automatically highlights whichever page you are currently viewing.
//    - Works as a permanent sidebar on laptops/desktops, and as a slide-out drawer on phones.
// 4. How it connects to other parts:
//    - Rendered on every authenticated page inside 'App.jsx'.
// ============================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  BellRing,
  User,
  X,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'All Purchases', path: '/purchases', icon: Receipt },
  { name: 'Add Purchase', path: '/purchases/new', icon: PlusCircle },
  { name: 'Upcoming Deadlines', path: '/deadlines', icon: BellRing },
  { name: 'Profile & Settings', path: '/profile', icon: User }
];

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-slate-900 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const renderNavList = () => (
    <div className="flex flex-col justify-between h-full p-4">
      <div>
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Menu
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={linkClass}
                end={item.path === '/'}
              >
                <Icon className="w-4 h-4 flex-shrink-0 stroke-[2]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Subtle Sidebar Helper Footer */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>Protection Active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
            Automated email alerts are scheduled for return deadlines and warranty expirations.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)]">
        {renderNavList()}
      </aside>

      {/* 2. Mobile Drawer & Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer panel */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-full bg-white shadow-xl z-10 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-800">Navigation</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">{renderNavList()}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
