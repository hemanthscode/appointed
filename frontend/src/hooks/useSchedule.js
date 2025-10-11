import { useState, useEffect } from 'react';
import scheduleService from '../services/scheduleService';

const useSchedule = (filters = {}) => {
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);

  const fetchSchedule = async params => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getSchedule(params);
      setSchedule(data.schedule);
    } catch (err) {
      setError(err.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await scheduleService.getScheduleStats();
      setStats(data.stats);
    } catch (err) {
      setStatsError(err.message || 'Failed to load schedule stats');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule(filters);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    schedule,
    stats,
    loading,
    statsLoading,
    error,
    statsError,
    refreshSchedule: () => fetchSchedule(filters),
    refreshStats: fetchStats,
  };
};

export default useSchedule;
