import { useState, useEffect } from 'react';
import metadataService from '../services/metadataService';

export default function useMetadata() {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointmentPurposes, setAppointmentPurposes] = useState([]);
  const [userYears, setUserYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const [departmentsRes, timeSlotsRes, purposesRes, yearsRes] = await Promise.all([
          metadataService.getDepartments(),
          metadataService.getTimeSlots(),
          metadataService.getAppointmentPurposes(),
          metadataService.getUserYears(),
        ]);
        setDepartments(departmentsRes.departments);
        setTimeSlots(timeSlotsRes.timeSlots);
        setAppointmentPurposes(purposesRes.purposes);
        setUserYears(yearsRes.years);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
    fetchMetadata();
  }, []);

  const fetchSubjectsByDepartment = async (department) => {
    if (!department) return [];
    try {
      const { subjects } = await metadataService.getSubjects(department);
      setSubjects(subjects);
      return subjects;
    } catch {
      setSubjects([]);
      return [];
    }
  };

  return {
    departments,
    subjects,
    timeSlots,
    appointmentPurposes,
    userYears,
    fetchSubjectsByDepartment,
    loading,
  };
}
