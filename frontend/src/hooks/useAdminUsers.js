import { useState, useEffect, useRef, useCallback } from 'react';
import adminService from '../services/adminService';

// Helper: stable string for params (deterministic)
function stableStringify(obj) {
  try {
    // produce deterministic serialization by sorting keys
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      const keys = Object.keys(obj).sort();
      const out = {};
      for (const k of keys) out[k] = obj[k];
      return JSON.stringify(out);
    }
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

// Generic fetch hook pattern factory
function useFetchFactory(fetchFn) {
  const inFlightRef = useRef(new Map()); // map key-> { controller, promise }
  const lastParamsRef = useRef(null);

  const doFetch = useCallback(
    async (params) => {
      const key = stableStringify(params ?? {});
      // If exact same params currently in-flight, return that promise (dedupe)
      const existing = inFlightRef.current.get(key);
      if (existing) return existing.promise;

      const controller = new AbortController();
      const promise = (async () => {
        try {
          const res = await fetchFn(params, { signal: controller.signal });
          return res;
        } finally {
          // remove when done
          inFlightRef.current.delete(key);
        }
      })();

      inFlightRef.current.set(key, { controller, promise });
      lastParamsRef.current = key;
      return promise;
    },
    [fetchFn]
  );

  const cancelAll = useCallback(() => {
    for (const [, { controller }] of inFlightRef.current.entries()) {
      try { controller.abort(); } catch (_) {}
    }
    inFlightRef.current.clear();
  }, []);

  return { doFetch, cancelAll, lastParamsRef };
}

/* ------------------ hooks that use patterns ------------------ */

export const useUsers = (filters = {}) => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFn = useCallback(async (params, { signal } = {}) => {
    // adminService.getUsers should accept params and optional signal for aborting
    return adminService.getUsers(params, { signal });
  }, []);

  const { doFetch, cancelAll, lastParamsRef } = useFetchFactory(fetchFn);

  const fetchUsers = useCallback(
    async (params) => {
      const key = stableStringify(params ?? {});
      // avoid re-fetching if same params and currently loaded
      if (lastParamsRef.current === key && !loading) {
        // nothing to do — we already fetched this exact params recently
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await doFetch(params);
        // If aborted, doFetch will throw; otherwise update
        setUsers(data.users ?? []);
        setPagination(data.pagination ?? {});
      } catch (err) {
        if (err.name === 'AbortError') {
          // fetch cancelled — ignore
        } else {
          setError(err.message || 'Failed to load users');
        }
      } finally {
        setLoading(false);
      }
    },
    [doFetch, loading, lastParamsRef]
  );

  // effect: fetch when stable filters change
  useEffect(() => {
    const parsed = filters;
    fetchUsers(parsed);

    return () => {
      // cancel any outstanding requests when component unmounts or filters change
      cancelAll();
    };
    // we intentionally depend on stable stringified value to avoid object identity issues
    // React lint rule: keep filters in deps; in AdminPage we will memoize filters.
  }, [fetchUsers, filters, cancelAll]);

  const refresh = useCallback(() => fetchUsers(filters), [fetchUsers, filters]);

  return { users, pagination, loading, error, refresh };
};


export const useApprovals = (filters = {}) => {
  const [approvals, setApprovals] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFn = useCallback(async (params, { signal } = {}) => {
    return adminService.getApprovals(params, { signal });
  }, []);

  const { doFetch, cancelAll, lastParamsRef } = useFetchFactory(fetchFn);

  const fetchApprovals = useCallback(
    async (params) => {
      const key = stableStringify(params ?? {});
      if (lastParamsRef.current === key && !loading) return;
      setLoading(true);
      setError(null);
      try {
        const data = await doFetch(params);
        setApprovals(data.approvals ?? []);
        setPagination(data.pagination ?? {});
      } catch (err) {
        if (err.name === 'AbortError') {
          // ignore
        } else {
          setError(err.message || 'Failed to load approvals');
        }
      } finally {
        setLoading(false);
      }
    },
    [doFetch, loading, lastParamsRef]
  );

  useEffect(() => {
    const parsed = filters;
    fetchApprovals(parsed);
    return () => cancelAll();
  }, [fetchApprovals, filters, cancelAll]);

  const refresh = useCallback(() => fetchApprovals(filters), [fetchApprovals, filters]);

  return { approvals, pagination, loading, error, refresh };
};


export const useSystemStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};


export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
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
  }, []);

  const update = useCallback(async (newSettings) => {
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
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, error, refresh: fetchSettings, update };
};
