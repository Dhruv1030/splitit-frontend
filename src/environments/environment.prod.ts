/**
 * Production Environment Configuration
 * 
 * NOTE: Update these values before deploying to production!
 * 
 * Required Steps:
 * 1. Replace apiUrl with your actual production backend URL
 * 2. Ensure CORS is configured on the backend to allow this domain
 * 3. Configure SSL/TLS certificates for HTTPS
 * 4. Set up environment variables in your deployment platform (Vercel, Netlify, etc.)
 * 5. Enable production optimizations in angular.json
 */

export const environment = {
  // Production flag - enables production optimizations
  production: true,

  // Backend API URL - MUST BE UPDATED before deployment
  // Example: 'https://api.splitit.com' or 'https://your-backend.herokuapp.com'
  // You can also set this via build-time replacement in angular.json
  apiUrl: 'https://api-gateway.delightfulfield-e71e7e6d.eastus.azurecontainerapps.io/api',

  // API timeout in milliseconds
  apiTimeout: 30000,

  // Enable analytics (if integrated)
  enableAnalytics: true,

  // Enable error reporting (if integrated with Sentry, etc.)
  enableErrorReporting: true,

  // Feature flags for production
  features: {
    enablePWA: false,
    enableOfflineMode: false,
    enableNotifications: false,
  },

  // App version (update from package.json)
  version: '1.0.0',

  // App name
  appName: 'SplitIt',
};

