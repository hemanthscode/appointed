import { useState, useEffect } from 'react';
import appointmentService from '../services/appointmentService';

export default function useAppointments(filters = {}) {
  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments(filters);
      setAppointments(data.appointments);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [JSON.stringify(filters)]);

  return { appointments, pagination, loading, error, reload: loadAppointments };
}
