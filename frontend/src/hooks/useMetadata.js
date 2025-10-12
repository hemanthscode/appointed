import { useState, useEffect } from 'react';
import metadataService from '../services/metadataService';

export const useDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    metadataService.getDepartments()
      .then(res => setDepartments(res))
      .catch(err => setError(err.message || 'Failed to load departments'))
      .finally(() => setLoading(false));
  }, []);

  return { departments, loading, error };
};

export const useSubjects = (department) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!department) {
      setSubjects([]);
      return;
    }
    setLoading(true);
    setError(null);
    metadataService.getSubjects(department)
      .then(res => setSubjects(res))
      .catch(err => setError(err.message || 'Failed to load subjects'))
      .finally(() => setLoading(false));
  }, [department]);

  return { subjects, loading, error };
};

export const useTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    metadataService.getTimeSlots()
      .then(res => setTimeSlots(res))
      .catch(err => setError(err.message || 'Failed to load time slots'))
      .finally(() => setLoading(false));
  }, []);

  return { timeSlots, loading, error };
};

export const useAppointmentPurposes = () => {
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    metadataService.getAppointmentPurposes()
      .then(res => setPurposes(res))
      .catch(err => setError(err.message || 'Failed to load appointment purposes'))
      .finally(() => setLoading(false));
  }, []);

  return { purposes, loading, error };
};

export const useUserYears = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    metadataService.getUserYears()
      .then(res => setYears(res))
      .catch(err => setError(err.message || 'Failed to load years'))
      .finally(() => setLoading(false));
  }, []);

  return { years, loading, error };
};
