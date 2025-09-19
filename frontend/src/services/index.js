export { default as apiClient, apiService } from './api';
export { default as authService, AuthService } from './auth';

// Re-export commonly used functions
export {
  apiService as api
} from './api';

export {
  authService as auth
} from './auth';
