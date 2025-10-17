import React, { useEffect, useState } from 'react';
import * as scheduleService from '../../api/scheduleService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

const SlotManagement = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = () => {
    setLoading(true);
    // For simplicity assume date is today, modify if needed
    const today = new Date().toISOString().slice(0, 10);
    scheduleService
      .getTeacherSchedule({ date: today })
      .then(({ data }) => setSlots(data.data.scheduleSlots))
      .catch(() => setError('Failed to load slots'))
      .finally(() => setLoading(false));
  };

  const blockSlot = async (slotId) => {
    const reason = window.prompt('Reason for blocking?');
    if (!reason) return;
    try {
      await scheduleService.blockSlot({ slotId, blockReason: reason });
      loadSlots();
    } catch {
      alert('Failed to block slot');
    }
  };

  const unblockSlot = async (slotId) => {
    try {
      await scheduleService.unblockSlot(slotId);
      loadSlots();
    } catch {
      alert('Failed to unblock slot');
    }
  };

  const deleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    try {
      await scheduleService.deleteSlot(slotId);
      loadSlots();
    } catch {
      alert('Failed to delete slot');
    }
  };

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <main className="p-4 text-black max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Manage Slots</h1>
      {slots.length === 0 ? (
        <p>No slots available.</p>
      ) : (
        <table className="w-full border border-black rounded table-fixed">
          <thead>
            <tr>
              <th className="border border-black p-2 text-left">Time</th>
              <th className="border border-black p-2">Status</th>
              <th className="border border-black p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map(({ _id, time, status }) => (
              <tr key={_id}>
                <td className="border border-black p-2">{time}</td>
                <td className="border border-black p-2 text-center">{status}</td>
                <td className="border border-black p-2 text-center space-x-2">
                  {status !== 'blocked' && (
                    <Button onClick={() => blockSlot(_id)} className="bg-black text-white px-2 py-1 text-xs">
                      Block
                    </Button>
                  )}
                  {status === 'blocked' && (
                    <Button onClick={() => unblockSlot(_id)} className="bg-white text-black border border-black px-2 py-1 text-xs">
                      Unblock
                    </Button>
                  )}
                  {status !== 'booked' && (
                    <Button onClick={() => deleteSlot(_id)} className="bg-white text-black border border-black px-2 py-1 text-xs">
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default SlotManagement;
