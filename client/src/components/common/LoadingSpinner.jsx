// ============================================================================
// File: client/src/components/common/LoadingSpinner.jsx
// 1. What this file does:
//    Displays a rotating loading spinner with an optional message (like "Loading purchases...").
// 2. Why this file exists:
//    Lets users know that data is being fetched from the server so they don't think
//    the app is frozen.
// 3. Important points to remember:
//    - message: The helper text shown under the spinning icon.
//    - fullPage: When true, centers the spinner across the entire screen.
// 4. How it connects to other parts:
//    - Used by 'App.jsx' during login checks and on every page while loading data.
// ============================================================================

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${
        fullPage ? 'min-h-screen' : 'py-16'
      }`}
    >
      <Loader2 className="w-7 h-7 text-slate-800 animate-spin" />
      {message && (
        <p className="mt-2.5 text-xs font-medium text-slate-500">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
