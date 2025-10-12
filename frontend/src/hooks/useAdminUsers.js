import { useState, useEffect } from 'react';
import adminService from '../services/adminService';

const useUsers = (filters = {}) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers(params);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(filters);
  }, [JSON.stringify(filters)]);

  return { users, pagination, loading, error, refresh: () => fetchUsers(filters) };
};

const useApprovals = (filters = {}) => {
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApprovals = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getApprovals(params);
      setApprovals(data.approvals);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals(filters);
  }, [JSON.stringify(filters)]);

  return { approvals, pagination, loading, error, refresh: () => fetchApprovals(filters) };
};

const useSystemStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getSystemStats();
      setStats(data.stats || data);
    } catch (err) {
      setError(err.message || 'Failed to load system stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refresh: fetchStats };
};

const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getSettings();
      setSettings(data.settings || data);
    } catch (err) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const update = async (newSettings) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.updateSettings(newSettings);
      setSettings(data.settings || data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, refresh: fetchSettings, update };
};

export { useUsers, useApprovals, useSystemStats, useSettings };
