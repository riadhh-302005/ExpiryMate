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
//    - Explains the email rules (returns in ≤3 days, warranties in ≤30 days).
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

      {/* Email Notifications Policy & Testing Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Automated Email Reminders</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured dispatch thresholds and duplicate protection
            </p>
          </div>
        </div>

        {/* Policy Explanations */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold">Return Windows:</strong> Dispatched{' '}
              <span className="font-semibold text-slate-900">3 days</span> before any registered return deadline expires.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold">Warranty Coverage:</strong> Dispatched{' '}
              <span className="font-semibold text-slate-900">30 days</span> before manufacturer warranty expires.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-semibold">Delivery Guard:</strong> Sent status is persisted on each
              purchase to guarantee zero duplicate notifications.
            </div>
          </div>
        </div>

        {/* Trigger Test Reminder Button */}
        <div className="pt-2">
          <p className="text-xs text-slate-500 mb-3">
            Test reminder delivery immediately without waiting for the scheduled daily cron job:
          </p>
          <button
            onClick={handleTestReminders}
            disabled={triggering}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
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
              <p className="font-bold">
                {reminderResult.testEmailSent
                  ? 'Verification Email Delivered!'
                  : 'Reminder scan completed successfully'}
              </p>
              {reminderResult.testEmailSent ? (
                <p className="mt-0.5 text-emerald-700">
                  A verification alert was dispatched directly to <strong>{user?.email}</strong>. Check your inbox!
                </p>
              ) : (
                <p className="mt-0.5 text-emerald-700">
                  Processed: {reminderResult.returnRemindersSent} return alert(s),{' '}
                  {reminderResult.warrantyRemindersSent} warranty alert(s).
                </p>
              )}
            </div>
          </div>
        )}

        {testError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold">Email Dispatch Issue</p>
              <p className="mt-0.5">{testError}</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout Action */}
      <div className="pt-1">
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
