// ============================================================================
// File: client/src/pages/ProfilePage.jsx
// 1. What this file does:
//    Displays your user profile information (name, email, member since date)
//    and includes a button to test sending reminder emails immediately.
// 2. Why this file exists in the application:
//    Lets users check their account details and gives students or interviewers
//    a quick way to test the email alert system on demand without waiting for 8:00 AM.
// 3. Important points to remember:
//    - Gets the logged-in user info from `AuthContext`.
//    - The "Send Test Alerts Now" button calls `/api/dashboard/trigger-reminders`.
//    - Explains the email rules (returns in ≤7 days, warranties in ≤30 days).
// 4. How it connects to other parts of the application:
//    Accessible from the sidebar and top navbar at `/profile`.
// ============================================================================

import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  BellRing,
  Send,
  Loader2,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { triggerReminders } from '../services/dashboardService';
import { formatDate } from '../utils/dateUtils';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [triggering, setTriggering] = useState(false);
  const [reminderResult, setReminderResult] = useState(null);
  const [testError, setTestError] = useState(null);

  const handleTestReminders = async () => {
    try {
      setTriggering(true);
      setTestError(null);
      setReminderResult(null);

      const res = await triggerReminders();
      if (res.success) {
        setReminderResult(res.result);
      } else {
        setTestError(res.message || 'Failed to trigger reminder check.');
      }
    } catch (err) {
      setTestError(err.message || 'Error executing reminder check.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200/60">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Account & Notification Settings
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Manage your personal profile and review automated reminder rules.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-xs">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Registered Email</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Member Since</span>
              <span className="font-semibold text-slate-800">
                {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Reminders Configuration Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Automated Email Reminders
            </h3>
            <p className="text-xs text-slate-500">
              Configured dispatch thresholds and duplicate protection
            </p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Return Windows:</strong> Dispatched <strong>3 days</strong> before any registered return deadline expires.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Warranty Coverage:</strong> Dispatched <strong>30 days</strong> before manufacturer warranty expires.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Delivery Guard:</strong> Sent status is persisted on each purchase to guarantee zero duplicate notifications.
            </span>
          </div>
        </div>

        {/* Manual Test Action */}
        <div className="pt-2">
          <p className="text-xs text-slate-500 mb-2.5">
            Test reminder delivery immediately without waiting for the scheduled daily cron job:
          </p>

          <button
            type="button"
            disabled={triggering}
            onClick={handleTestReminders}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shadow-xs"
          >
            {triggering ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Scanning & Sending Reminders...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Test Email Reminders Now
              </>
            )}
          </button>
        </div>

        {/* Result Feedback */}
        {reminderResult && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Reminder scan completed successfully</p>
              <p className="mt-0.5 text-emerald-700">
                Processed: {reminderResult.returnRemindersSent} return alert(s),{' '}
                {reminderResult.warrantyRemindersSent} warranty alert(s).
              </p>
              <p className="text-[11px] text-emerald-600 mt-0.5">
                (In local development without external SMTP keys, email previews are logged to the server terminal console).
              </p>
            </div>
          </div>
        )}

        {testError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{testError}</span>
          </div>
        )}
      </div>

      {/* Logout Action */}
      <div className="pt-1">
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
