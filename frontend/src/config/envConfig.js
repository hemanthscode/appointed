const envConfig = {
  NODE_ENV: import.meta.env.MODE || 'development',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};

export default envConfig;
