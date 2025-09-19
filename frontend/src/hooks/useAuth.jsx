import { useState, useEffect, useContext, createContext } from 'react';
import authService from '../services/auth';
import { MOCK_TEACHERS, MOCK_STUDENTS } from '../data/mockData';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getUser());
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        if (authService.isAuthenticated()) {
          // Try to refresh token if we have one
          if (authService.refreshToken) {
            try {
              await authService.refreshAccessToken();
              setUser(authService.getUser());
            } catch (error) {
              console.warn('Token refresh failed:', error.message);
              // Keep existing user data, token might still be valid
            }
          }
        }
      } catch (error) {
        console.warn('Auth initialization failed:', error.message);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      // For demo purposes, simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data
      let mockUser = null;
      const email = credentials.email.toLowerCase();
      
      // Check teachers first
      const teacher = MOCK_TEACHERS.find(t => t.email.toLowerCase() === email);
      if (teacher) {
        mockUser = {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          role: 'teacher',
          department: teacher.department,
          avatar: null,
          status: teacher.status
        };
      } else {
        // Check students
        const student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === email);
        if (student) {
          mockUser = {
            id: student.id,
            name: student.name,
            email: student.email,
            role: 'student',
            department: student.department,
            year: student.year,
            avatar: null,
            status: student.status
          };
        }
      }

      // Admin user
      if (email === 'admin@university.edu') {
        mockUser = {
          id: 999,
          name: 'System Admin',
          email: 'admin@university.edu',
          role: 'admin',
          department: 'Administration',
          avatar: null,
          status: 'active'
        };
      }

      if (!mockUser) {
        throw new Error('Invalid email or password');
      }

      // Simulate token
      const mockToken = `mock_token_${mockUser.id}_${Date.now()}`;
      
      // Set auth data
      authService.setAuth(mockToken, mockUser);
      setUser(mockUser);
      
      return { success: true, data: { user: mockUser, token: mockToken } };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const mockUser = {
        id: Date.now(),
        name: userData.fullName,
        email: userData.email,
        role: userData.userType,
        department: userData.department,
        year: userData.userType === 'student' ? '1st Year' : null,
        avatar: null,
        status: 'pending' // New users need approval
      };
      
      // Simulate token
      const mockToken = `mock_token_${mockUser.id}_${Date.now()}`;
      
      // Set auth data
      authService.setAuth(mockToken, mockUser);
      setUser(mockUser);
      
      return { success: true, data: { user: mockUser, token: mockToken } };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      const updatedUser = { ...user, ...profileData };
      authService.setAuth(authService.getToken(), updatedUser);
      setUser(updatedUser);
      
      return { success: true, data: updatedUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const result = await authService.forgotPassword(email);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      const result = await authService.resetPassword(token, password);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Helper methods
  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const isAdmin = () => hasRole('admin');
  const isTeacher = () => hasRole('teacher');
  const isStudent = () => hasRole('student');

  const value = {
    // State
    user,
    loading,
    initialized,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    
    // Helpers
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isTeacher,
    isStudent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
