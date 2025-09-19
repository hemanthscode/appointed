// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_TIMEOUT = 10000; // 10 seconds

// API Client class
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set authentication token
  setAuthToken(token) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      timeout: API_TIMEOUT,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload request
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type header to let browser set it with boundary
        ...Object.fromEntries(
          Object.entries(this.defaultHeaders).filter(([key]) => key !== 'Content-Type')
        ),
      },
    });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// API Service Functions
export const apiService = {
  // Authentication
  auth: {
    login: (credentials) => apiClient.post('/api/auth/login', credentials),
    register: (userData) => apiClient.post('/api/auth/register', userData),
    logout: () => apiClient.post('/api/auth/logout'),
    refreshToken: () => apiClient.post('/api/auth/refresh'),
    forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
    resetPassword: (token, password) => apiClient.post('/api/auth/reset-password', { token, password }),
  },

  // Users
  users: {
    getProfile: () => apiClient.get('/api/users/profile'),
    updateProfile: (data) => apiClient.put('/api/users/profile', data),
    uploadAvatar: (formData) => apiClient.upload('/api/users/avatar', formData),
    getTeachers: (params) => apiClient.get('/api/users/teachers', params),
    getStudents: (params) => apiClient.get('/api/users/students', params),
    getUserById: (id) => apiClient.get(`/api/users/${id}`),
  },

  // Appointments
  appointments: {
    getAll: (params) => apiClient.get('/api/appointments', params),
    getById: (id) => apiClient.get(`/api/appointments/${id}`),
    create: (data) => apiClient.post('/api/appointments', data),
    update: (id, data) => apiClient.put(`/api/appointments/${id}`, data),
    delete: (id) => apiClient.delete(`/api/appointments/${id}`),
    approve: (id, data) => apiClient.patch(`/api/appointments/${id}/approve`, data),
    reject: (id, data) => apiClient.patch(`/api/appointments/${id}/reject`, data),
    cancel: (id, data) => apiClient.patch(`/api/appointments/${id}/cancel`, data),
    reschedule: (id, data) => apiClient.patch(`/api/appointments/${id}/reschedule`, data),
  },

  // Messages
  messages: {
    getConversations: () => apiClient.get('/api/messages/conversations'),
    getMessages: (conversationId, params) => apiClient.get(`/api/messages/${conversationId}`, params),
    sendMessage: (data) => apiClient.post('/api/messages/send', data),
    markAsRead: (conversationId) => apiClient.patch(`/api/messages/${conversationId}/read`),
    deleteConversation: (conversationId) => apiClient.delete(`/api/messages/${conversationId}`),
  },

  // Schedule (for teachers)
  schedule: {
    getSchedule: (params) => apiClient.get('/api/schedule', params),
    updateSchedule: (data) => apiClient.put('/api/schedule', data),
    getAvailableSlots: (teacherId, date) => apiClient.get(`/api/schedule/available/${teacherId}`, { date }),
    blockSlot: (data) => apiClient.post('/api/schedule/block', data),
    unblockSlot: (slotId) => apiClient.delete(`/api/schedule/block/${slotId}`),
  },

  // Admin
  admin: {
    getUsers: (params) => apiClient.get('/api/admin/users', params),
    updateUserStatus: (userId, status) => apiClient.patch(`/api/admin/users/${userId}/status`, { status }),
    deleteUser: (userId) => apiClient.delete(`/api/admin/users/${userId}`),
    getApprovals: (params) => apiClient.get('/api/admin/approvals', params),
    approveUser: (approvalId, data) => apiClient.patch(`/api/admin/approvals/${approvalId}/approve`, data),
    rejectUser: (approvalId, data) => apiClient.patch(`/api/admin/approvals/${approvalId}/reject`, data),
    getSystemStats: () => apiClient.get('/api/admin/stats'),
    getSettings: () => apiClient.get('/api/admin/settings'),
    updateSettings: (data) => apiClient.put('/api/admin/settings', data),
  },

  // Notifications
  notifications: {
    getAll: (params) => apiClient.get('/api/notifications', params),
    markAsRead: (notificationId) => apiClient.patch(`/api/notifications/${notificationId}/read`),
    markAllAsRead: () => apiClient.patch('/api/notifications/read-all'),
    delete: (notificationId) => apiClient.delete(`/api/notifications/${notificationId}`),
    getUnreadCount: () => apiClient.get('/api/notifications/unread-count'),
  },

  // Departments & Subjects
  metadata: {
    getDepartments: () => apiClient.get('/api/metadata/departments'),
    getSubjects: (departmentId) => apiClient.get(`/api/metadata/subjects/${departmentId}`),
    getTimeSlots: () => apiClient.get('/api/metadata/time-slots'),
    getAppointmentPurposes: () => apiClient.get('/api/metadata/appointment-purposes'),
  },
};

// Response interceptor for handling common errors
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        break;
      case 403:
        // Forbidden
        throw new Error('Access denied. You don\'t have permission to perform this action.');
      case 404:
        throw new Error('The requested resource was not found.');
      case 422:
        // Validation errors
        throw new Error(data.message || 'Validation error occurred.');
      case 500:
        throw new Error('Internal server error. Please try again later.');
      default:
        throw new Error(data.message || 'An unexpected error occurred.');
    }
  } else if (error.request) {
    // Network error
    throw new Error('Network error. Please check your internet connection.');
  } else {
    // Other errors
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};

// Set up response interceptor
const originalRequest = apiClient.request.bind(apiClient);
apiClient.request = async (endpoint, options) => {
  try {
    return await originalRequest(endpoint, options);
  } catch (error) {
    handleApiError(error);
  }
};

// Export API client and service
export default apiClient;
export { apiClient };
