import React, { useEffect, useState } from 'react';
import * as scheduleService from '../../api/scheduleService';
import Loader from '../../components/common/Loader';

const ScheduleView = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [error, setError] = useState('');

  useEffect(() => {
    loadSchedule(date);
  }, [date]);

  const loadSchedule = (selectedDate) => {
    setLoading(true);
    scheduleService
      .getTeacherSchedule({ date: selectedDate })
      .then(({ data }) => setSlots(data.data.scheduleSlots))
      .catch(() => setError('Failed to load schedule'))
      .finally(() => setLoading(false));
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="p-4 text-black max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Schedule</h1>
      <input
        type="date"
        value={date}
        onChange={handleDateChange}
        className="border border-black rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
      />
      {slots.length === 0 ? (
        <p>No slots for selected date.</p>
      ) : (
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li key={slot._id} className="p-3 border border-black rounded bg-white flex justify-between">
              <span>{slot.time}</span>
              <span>{slot.status}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default ScheduleView;
