// pages/SchedulePage.jsx
import React, { useState } from 'react';
import { Layout } from '../components/common';
import { Card, Button, Modal, Badge } from '../components/ui';
import { useSchedule } from '../hooks';
import ScheduleForm from '../components/forms/ScheduleForm';
import scheduleService from '../services/scheduleService';

const SchedulePage = () => {
  const { schedule, stats, loading, statsLoading, error, statsError, refreshSchedule, refreshStats } = useSchedule();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const openModal = (slot = null) => {
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSlot(null);
    setModalOpen(false);
    setActionError(null);
  };

  const handleSave = async (data) => {
    setActionError(null);
    setActionLoading(true);
    try {
      if (selectedSlot && selectedSlot._id) {
        await scheduleService.updateSchedule({ ...data, _id: selectedSlot._id });
      } else {
        await scheduleService.updateSchedule(data);
      }
      await refreshSchedule();
      await refreshStats();
      closeModal();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (slotId) => {
    setActionError(null);
    setActionLoading(true);
    try {
      await scheduleService.deleteSlot(slotId);
      await refreshSchedule();
      await refreshStats();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Schedule</h1>

        {error && <div className="text-red-600">{error}</div>}
        {statsError && <div className="text-red-600">{statsError}</div>}
        {actionError && <div className="text-red-600">{actionError}</div>}

        <div className="flex space-x-8 mb-6">
          <Badge variant="info" size="medium">Total Slots: {stats.totalSlots ?? '-'}</Badge>
          <Badge variant="success" size="medium">Available: {stats.availableSlots ?? '-'}</Badge>
          <Badge variant="warning" size="medium">Blocked: {stats.blockedSlots ?? '-'}</Badge>
        </div>

        <Button onClick={() => openModal()} variant="primary">Add Slot</Button>

        {loading ? (
          <div className="text-center text-gray-400 mt-12">Loading schedule...</div>
        ) : schedule.length === 0 ? (
          <p className="text-gray-500 italic mt-6">No schedule slots found.</p>
        ) : (
          schedule.map((slot) => (
            <Card key={slot._id} className="mb-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{new Date(slot.date).toLocaleDateString()}</div>
                <div className="text-gray-400">{slot.time}</div>
                <div className="text-sm text-gray-500">{slot.status.toUpperCase()}</div>
                {slot.status === 'blocked' && (
                  <div className="text-xs text-red-400">Reason: {slot.blockReason}</div>
                )}
              </div>
              <div className="space-x-3">
                <Button size="small" variant="secondary" onClick={() => openModal(slot)}>Edit</Button>
                <Button size="small" variant="danger" onClick={() => handleDelete(slot._id)} disabled={actionLoading}>
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </Card>
          ))
        )}

        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          size="medium"
          title={selectedSlot ? 'Edit Schedule Slot' : 'Add Schedule Slot'}
          showCloseButton
        >
          <ScheduleForm onSubmit={handleSave} loading={actionLoading} onCancel={closeModal} initialData={selectedSlot} />
        </Modal>
      </div>
    </Layout>
  );
};

export default SchedulePage;
