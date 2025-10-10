import React, { useEffect, useState } from 'react';
import { Layout } from '../components/common';
import { Card, Button, Select, Input } from '../components/ui';
import scheduleService from '../services/scheduleService';
import { useToast } from '../contexts/ToastContext';
import useMetadata from '../hooks/useMetadata';
import { useAuth } from '../contexts/AuthContext';

const SchedulePage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const { timeSlots, loading: metaLoading } = useMetadata();

  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [blocking, setBlocking] = useState(false);

  const loadSchedule = async () => {
    if (!user) return;
    setLoadingSchedule(true);
    try {
      const data = await scheduleService.getSchedule({ page: 1, limit: 20 });
      setSchedule(data.schedule || []);
    } catch {
      toast.addToast('Failed to load your schedule.', 'error');
    }
    setLoadingSchedule(false);
  };

  useEffect(() => {
    loadSchedule();
  }, [user]);

  const handleBlockSlot = async () => {
    if (!blockDate || !blockTime) {
      toast.addToast('Select date and time to block.', 'error');
      return;
    }
    setBlocking(true);
    try {
      await scheduleService.blockSlot({ date: blockDate, time: blockTime });
      toast.addToast('Slot blocked successfully.', 'success');
      setBlockDate('');
      setBlockTime('');
      loadSchedule();
    } catch {
      toast.addToast('Failed to block slot.', 'error');
    }
    setBlocking(false);
  };

  const handleUnblockSlot = async (slotId) => {
    try {
      await scheduleService.unblockSlot(slotId);
      toast.addToast('Slot unblocked.', 'success');
      loadSchedule();
    } catch {
      toast.addToast('Failed to unblock slot.', 'error');
    }
  };

  return (
    <Layout headerTitle="My Schedule">
      <section className="max-w-5xl mx-auto p-6 text-white space-y-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Block a Time Slot</h2>
          <div className="flex space-x-4 max-w-md">
            <Input
              type="date"
              label="Date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              disabled={blocking || metaLoading}
            />
            <Select
              label="Time"
              value={blockTime}
              onChange={(e) => setBlockTime(e.target.value)}
              options={[{ value: '', label: 'Select Time' }, ...timeSlots.map((t) => ({ value: t, label: t }))]}
              disabled={blocking || metaLoading}
            />
            <Button variant="primary" onClick={handleBlockSlot} loading={blocking} disabled={blocking}>
              Block
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Blocked Slots</h2>
          {loadingSchedule ? (
            <p>Loading schedule...</p>
          ) : schedule.length === 0 ? (
            <p>No blocked slots.</p>
          ) : (
            <ul className="space-y-4">
              {schedule.map(({ id, date, time }) => (
                <Card key={id} className="flex justify-between items-center p-4">
                  <p>
                    {date} at {time}
                  </p>
                  <Button variant="danger" size="small" onClick={() => handleUnblockSlot(id)}>
                    Unblock
                  </Button>
                </Card>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default SchedulePage;
