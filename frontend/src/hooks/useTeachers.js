import { useState, useEffect } from 'react';
import userService from '../services/userService';

export default function useTeachers(filters) {
  const [teachers, setTeachers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getTeachers(filters);
      setTeachers(data.teachers);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [JSON.stringify(filters)]);

  return { teachers, pagination, loading, error, reload: loadTeachers };
}
