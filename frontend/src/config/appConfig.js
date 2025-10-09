const appConfig = {
  appName: 'Appointed',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  defaultTimeout: 10000, // ms
  maxFileSize: 5 * 1024 * 1024, // 5MB
};

export default appConfig;
