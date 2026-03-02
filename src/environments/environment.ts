/**
 * Development Environment Configuration
 * 
 * This configuration is used during local development with `ng serve`
 * The API calls are proxied through proxy.conf.json to avoid CORS issues
 */

export const environment = {
  // Development flag
  production: false,

  // API URL - proxied through proxy.conf.json
  // Requests to /api/* are forwarded to http://localhost:8080/api/*
  apiUrl: '/api',

  // API timeout in milliseconds
  apiTimeout: 30000,

  // Enable analytics in development (usually disabled)
  enableAnalytics: false,

  // Enable error reporting in development (usually disabled)
  enableErrorReporting: false,

  // Feature flags for development
  features: {
    enablePWA: false,
    enableOfflineMode: false,
    enableNotifications: false,
  },

  // App version
  version: '1.0.0-dev',

  // App name
  appName: 'SplitIt (Dev)',
};

