import { useState, useEffect } from 'react';
import adminService from '../services/adminService';

export default function useAdminUsers(filters) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers(filters);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [JSON.stringify(filters)]);

  const bulkOperation = async (body) => {
    try {
      await adminService.bulkUserOperation(body);
      await loadUsers();
    } catch (err) {
      throw err;
    }
  };

  return { users, pagination, loading, error, reload: loadUsers, bulkOperation };
}
