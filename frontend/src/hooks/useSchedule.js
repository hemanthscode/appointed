import { useState, useEffect } from 'react';
import scheduleService from '../services/scheduleService';

export default function useSchedule(params) {
  const [schedule, setSchedule] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getSchedule(params);
      setSchedule(data.schedule);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [JSON.stringify(params)]);

  return { schedule, pagination, loading, error, reload: loadSchedule };
}
