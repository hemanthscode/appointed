import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { immediate = true, onSuccess, onError, transform } = options;

  const execute = useCallback(
    async (...args) => {
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
    },
    [apiFunction, transform, onSuccess, onError]
  );

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
    refetch,
  };
};

export default useApi;
