/**
 * Centralized configuration module for PPGameMgmt Web
 * 
 * This module combines all environment variables and application settings
 * into a single, type-safe configuration object that can be imported throughout the app.
 */

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000,
  },
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'PP Game Management',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    environment: import.meta.env.MODE,
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableNotifications: true,
  },
  auth: {
    tokenStorageKey: 'ppgm_auth_token',
    refreshTokenStorageKey: 'ppgm_refresh_token',
  }
};

// Type definition for the config
export type AppConfig = typeof config;

// Helper function to get a specific config value with full type safety
export function getConfigValue<
  K1 extends keyof AppConfig,
  K2 extends keyof AppConfig[K1]
>(key1: K1, key2: K2): AppConfig[K1][K2] {
  return config[key1][key2];
}