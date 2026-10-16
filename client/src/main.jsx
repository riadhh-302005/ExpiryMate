// ============================================================================
// File: client/src/main.jsx
// 1. What this file does:
//    This is the main entry file for our React frontend. It takes our React app
//    and inserts it into the 'index.html' web page so the browser can display it.
// 2. Why this file exists:
//    Every Vite + React app needs this starting file to attach React to the browser's DOM.
// 3. Important points to remember:
//    - Imports 'index.css' so Tailwind styling works across the whole website.
//    - Uses React 18's createRoot to render the top-level <App /> component.
// 4. How it connects to other parts:
//    - Loaded by 'index.html' and loads our root component 'App.jsx'.
// ============================================================================

import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
