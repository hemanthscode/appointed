import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

// Generic API hook for data fetching
const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    immediate = true,
    onSuccess,
    onError,
    transform,
  } = options;

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(...args);
      const result = transform ? transform(response.data) : response.data;
      
      setData(result);
      onSuccess?.(result);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, transform, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  const refetch = useCallback(() => execute(), [execute]);
  
  return {
    data,
    loading,
    error,
    execute,
    refetch
  };
};

export default useApi;

// Specific hooks for common API operations
export const useAppointments = (params = {}) => {
  return useApi(
    () => apiService.appointments.getAll(params),
    [JSON.stringify(params)],
    {
      transform: (data) => data.appointments || [],
    }
  );
};

export const useTeachers = (params = {}) => {
  return useApi(
    () => apiService.users.getTeachers(params),
    [JSON.stringify(params)],
    {
      transform: (data) => data.teachers || [],
    }
  );
};

export const useMessages = (conversationId) => {
  return useApi(
    () => apiService.messages.getMessages(conversationId),
    [conversationId],
    {
      immediate: !!conversationId,
      transform: (data) => data.messages || [],
    }
  );
};

export const useProfile = () => {
  return useApi(
    () => apiService.users.getProfile(),
    [],
    {
      transform: (data) => data.user || null,
    }
  );
};

// Hook for mutations (POST, PUT, DELETE operations)
export const useMutation = (apiFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    onSuccess,
    onError,
    onSettled,
  } = options;

  const mutate = useCallback(async (variables) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction(variables);
      const result = response.data;
      
      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);
      
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      onError?.(errorMessage, variables);
      onSettled?.(null, errorMessage, variables);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, onSettled]);

  return {
    mutate,
    loading,
    error,
  };
};

// Specific mutation hooks
export const useCreateAppointment = (options = {}) => {
  return useMutation(apiService.appointments.create, options);
};

export const useUpdateAppointment = (options = {}) => {
  return useMutation(
    ({ id, ...data }) => apiService.appointments.update(id, data),
    options
  );
};

export const useDeleteAppointment = (options = {}) => {
  return useMutation(apiService.appointments.delete, options);
};

export const useSendMessage = (options = {}) => {
  return useMutation(apiService.messages.sendMessage, options);
};

export const useUpdateProfile = (options = {}) => {
  return useMutation(apiService.users.updateProfile, options);
};

// Hook for paginated data
export const usePaginatedApi = (apiFunction, initialParams = {}, options = {}) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { transform, onSuccess, onError } = options;

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction({
        ...initialParams,
        ...params,
      });
      
      const result = transform ? transform(response.data) : response.data;
      const newData = result.data || [];
      const newPagination = result.pagination || {};
      
      // If it's first page or page 1, replace data; otherwise append
      if (params.page === 1 || !params.page) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }
      
      setPagination(newPagination);
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, initialParams, transform, onSuccess, onError]);

  useEffect(() => {
    fetchData({ page: 1 });
  }, []);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchData({ page: pagination.page + 1 });
    }
  }, [pagination.page, pagination.totalPages, loading, fetchData]);

  const refresh = useCallback(() => {
    fetchData({ page: 1 });
  }, [fetchData]);

  const hasMore = pagination.page < pagination.totalPages;

  return {
    data,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
    hasMore,
  };
};

// Hook for optimistic updates
export const useOptimisticMutation = (apiFunction, options = {}) => {
  const [optimisticData, setOptimisticData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    onSuccess,
    onError,
    onMutate,
    rollbackOnError = true,
  } = options;

  const mutate = useCallback(async (variables) => {
    setLoading(true);
    setError(null);
    
    // Apply optimistic update
    const optimisticUpdate = onMutate?.(variables);
    if (optimisticUpdate) {
      setOptimisticData(optimisticUpdate);
    }
    
    try {
      const response = await apiFunction(variables);
      const result = response.data;
      
      setOptimisticData(null);
      onSuccess?.(result, variables);
      
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      // Rollback optimistic update on error
      if (rollbackOnError) {
        setOptimisticData(null);
      }
      
      onError?.(errorMessage, variables);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onMutate, onSuccess, onError, rollbackOnError]);

  return {
    mutate,
    loading,
    error,
    optimisticData,
  };
};
