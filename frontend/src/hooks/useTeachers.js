import { useState, useEffect } from 'react';
import userService from '../services/userService';

const useTeachers = (filters = { page: 1, limit: 10 }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [error, setError] = useState(null);

  const loadTeachers = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getTeachers(params);
      if (Array.isArray(data)) {
        setTeachers(data);
        setPagination({});
      } else {
        setTeachers(data.teachers || []);
        setPagination(data.pagination || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers(filters);
  }, [JSON.stringify(filters)]);

  return { teachers, loading, pagination, error, reload: () => loadTeachers(filters) };
};

export default useTeachers;
