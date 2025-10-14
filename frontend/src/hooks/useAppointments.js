import { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';

const useAppointments = (filters = {}) => {
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments(params);
      // Handle array vs object response
      if (Array.isArray(data)) {
        setAppointments(data);
        setPagination({});
      } else {
        setAppointments(data.appointments || []);
        setPagination(data.pagination || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(filters);
  }, [JSON.stringify(filters)]);

  return {
    appointments,
    pagination,
    loading,
    error,
    refresh: () => fetchAppointments(filters),
  };
};

export default useAppointments;
