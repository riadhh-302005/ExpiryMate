// ============================================================================
// File: client/tailwind.config.js
// 1. What this file does:
//    Configures Tailwind CSS utility classes, template scanning paths, and custom
//    theme colors for ExpiryMate.
// 2. Why this file exists in the application:
//    Provides consistent design tokens (slate, indigo, emerald, amber, rose) and
//    scans all React JSX files to generate minimum required CSS bundle.
// 3. Important functions, variables, or concepts to remember:
//    - content: Points to index.html and all source code files in src directory.
//    - theme.extend: Configured for modern SaaS clean typography and subtle borders.
// 4. How it connects to other parts of the application:
//    Processed by PostCSS and imported via index.css across the entire frontend.
// ============================================================================

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      }
    },
  },
  plugins: [],
};
