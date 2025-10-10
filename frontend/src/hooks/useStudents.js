import { useState, useEffect } from 'react';
import userService from '../services/userService';

export default function useStudents(filters) {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getStudents(filters);
      setStudents(data.students);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [JSON.stringify(filters)]);

  return { students, pagination, loading, error, reload: loadStudents };
}
