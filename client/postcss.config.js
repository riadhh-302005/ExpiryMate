/**
 * ============================================================================
 * File: client/postcss.config.js
 * 1. What this file does:
 *    Configures the PostCSS processor pipeline with Tailwind CSS and Autoprefixer.
 * 2. Why this file exists in the application:
 *    Allows Vite to compile Tailwind CSS utility classes into production-ready CSS.
 * 3. Important functions, variables, or concepts to remember:
 *    - tailwindcss: Generates utility classes.
 *    - autoprefixer: Adds necessary vendor prefixes for cross-browser compatibility.
 * 4. How it connects to other parts of the application:
 *    Loaded automatically by Vite when processing src/index.css.
 * ============================================================================
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
