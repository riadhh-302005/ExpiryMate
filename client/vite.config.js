/**
 * ============================================================================
 * File: client/vite.config.js
 * 1. What this file does:
 *    Configures Vite build tooling, React Fast Refresh plugin, and dev server
 *    proxy routing for backend API endpoints and uploaded assets.
 * 2. Why this file exists in the application:
 *    Serves as the bundler and development server configuration for the React client.
 * 3. Important functions, variables, or concepts to remember:
 *    - proxy: Forwards /api and /uploads requests directly to http://localhost:5000
 *      in development to simplify CORS and cookie handling.
 *    - port: Fixed to 5173 for predictability.
 * 4. How it connects to other parts of the application:
 *    Directs frontend network traffic to the Express backend in server/server.js.
 * ============================================================================
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
